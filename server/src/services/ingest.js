import { env } from '../config/env.js'

/**
 * Turns an uploaded file into a plain-text transcript for the report pipeline.
 *
 * - text (txt/vtt/srt/md) → read as-is
 * - Word (docx)          → mammoth text extraction
 * - PDF                  → pdf-parse text extraction
 * - audio/video          → Deepgram speech-to-text (prerecorded)
 *
 * Heavy dependencies (mammoth, pdf-parse, @deepgram/sdk) are imported lazily so
 * they never load unless the matching file type is actually uploaded.
 */

const AUDIO_EXT = /\.(mp3|mp4|wav|m4a)$/i
const TEXT_EXT = /\.(txt|vtt|srt|md)$/i
const DOCX_EXT = /\.docx$/i
const PDF_EXT = /\.pdf$/i
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** A friendly, client-safe error with an HTTP status. */
export class IngestError extends Error {
  constructor(message, status = 422) {
    super(message)
    this.status = status
    this.publicMessage = message
  }
}

export const deepgramConfigured = () => Boolean(env.deepgramKey)

export function fileKind(file) {
  const name = file?.originalname || ''
  const mime = file?.mimetype || ''
  if (AUDIO_EXT.test(name) || /^(audio|video)\//.test(mime)) return 'audio'
  if (DOCX_EXT.test(name) || mime === DOCX_MIME) return 'docx'
  if (PDF_EXT.test(name) || mime === 'application/pdf') return 'pdf'
  if (TEXT_EXT.test(name) || mime.startsWith('text/')) return 'text'
  return 'unsupported'
}

/** Race a promise against a timeout so a stuck transcription can't hang forever. */
function withTimeout(promise, ms, label) {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new IngestError(`${label} timed out. Try a shorter recording.`, 504)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t))
}

async function extractDocx(buffer) {
  try {
    const { default: mammoth } = await import('mammoth')
    const { value } = await mammoth.extractRawText({ buffer })
    return (value || '').trim()
  } catch {
    throw new IngestError('We couldn’t read that Word document. Re-save it as .docx and try again.', 422)
  }
}

async function extractPdf(buffer) {
  let parser
  try {
    const { PDFParse } = await import('pdf-parse')
    parser = new PDFParse({ data: buffer })
    const { text } = await parser.getText()
    // pdf-parse inserts "-- N of M --" page separators; drop them.
    return (text || '')
      .split('\n')
      .filter((l) => !/^-- \d+ of \d+ --$/.test(l.trim()))
      .join('\n')
      .trim()
  } catch (err) {
    if (err instanceof IngestError) throw err
    throw new IngestError('We couldn’t read that PDF. It may be scanned or image-only (no selectable text).', 422)
  } finally {
    await parser?.destroy?.().catch(() => {})
  }
}

async function transcribeAudio(buffer, onStage) {
  if (!env.deepgramKey) {
    throw new IngestError(
      'Audio transcription isn’t configured on this server. Upload a transcript (TXT), a document (DOCX/PDF), or ask the admin to add a Deepgram API key.',
      503,
    )
  }
  onStage?.('transcript') // real "Transcribing" stage — begins before analysis
  const { DeepgramClient } = await import('@deepgram/sdk')
  const dg = new DeepgramClient({ apiKey: env.deepgramKey })

  let result
  try {
    result = await withTimeout(
      dg.listen.v1.media.transcribeFile(buffer, {
        model: 'nova-2',
        smart_format: true,
        detect_language: true,
      }),
      120_000,
      'Transcription',
    )
  } catch (err) {
    if (err instanceof IngestError) throw err // timeout
    throw new IngestError('We couldn’t transcribe that audio. Check the file is valid audio/video and try again.', 502)
  }

  const channel = result?.results?.channels?.[0]
  const transcript = (channel?.alternatives?.[0]?.transcript || '').trim()
  if (!transcript) throw new IngestError('No speech was detected in that recording.', 422)

  return {
    transcript,
    transcription: {
      engine: 'deepgram',
      language: channel?.detected_language || 'en',
      durationSec: Math.round(result?.metadata?.duration || 0),
    },
  }
}

/**
 * Ingest a file → `{ transcript, transcription }`. `transcription` is only set
 * for audio (Deepgram metadata); text/docx/pdf return null there.
 * `onStage(stage)` is called with `'transcript'` while audio is transcribing.
 */
export async function ingestFile(file, onStage) {
  const kind = fileKind(file)
  if (kind === 'unsupported') {
    throw new IngestError('Unsupported file type. Upload MP3, MP4, WAV, M4A, TXT, DOCX, or PDF.', 415)
  }
  if (kind === 'audio') return transcribeAudio(file.buffer, onStage)

  let transcript = ''
  if (kind === 'text') transcript = file.buffer.toString('utf8').trim()
  else if (kind === 'docx') transcript = await extractDocx(file.buffer)
  else if (kind === 'pdf') transcript = await extractPdf(file.buffer)

  if (!transcript) throw new IngestError('No readable text was found in that document.', 422)
  return { transcript, transcription: null }
}
