import net from 'node:net'

/**
 * A minimal but real SMTP server for tests: nodemailer talks to it over a genuine TCP
 * connection, so the whole send path (transport, headers, encoding) is exercised - only the
 * far end is fake. Records every accepted message; `reject: true` makes it refuse DATA the
 * way a provider that rejects a message would.
 */
export function startSmtpSink(port, { reject = false } = {}) {
  const messages = []
  const server = net.createServer((socket) => {
    let buf = ''
    let inData = false
    let current = { from: '', to: [], raw: '' }
    const reply = (s) => socket.write(`${s}\r\n`)
    reply('220 sink ESMTP')
    socket.on('data', (chunk) => {
      buf += chunk.toString('utf8')
      for (;;) {
        if (inData) {
          const end = buf.indexOf('\r\n.\r\n')
          if (end === -1) return
          current.raw = buf.slice(0, end)
          buf = buf.slice(end + 5)
          inData = false
          if (reject) {
            reply('554 5.7.1 Message rejected by policy')
          } else {
            messages.push(current)
            reply('250 2.0.0 OK queued')
          }
          current = { from: '', to: [], raw: '' }
          continue
        }
        const nl = buf.indexOf('\r\n')
        if (nl === -1) return
        const cmd = buf.slice(0, nl)
        buf = buf.slice(nl + 2)
        const verb = cmd.slice(0, 4).toUpperCase()
        if (verb === 'EHLO') reply('250-sink\r\n250 8BITMIME')
        else if (verb === 'HELO') reply('250 sink')
        else if (verb === 'MAIL') { current.from = cmd; reply('250 OK') }
        else if (verb === 'RCPT') { current.to.push(cmd); reply('250 OK') }
        else if (verb === 'DATA') { inData = true; reply('354 go ahead') }
        else if (verb === 'RSET' || verb === 'NOOP') reply('250 OK')
        else if (verb === 'QUIT') { reply('221 bye'); socket.end(); return }
        else reply('502 unsupported')
      }
    })
    socket.on('error', () => {})
  })
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ messages, close: () => new Promise((r) => server.close(r)) })))
}

/** Decode RFC 2047 encoded-words (=?UTF-8?Q?...?= / =?UTF-8?B?...?=) in a header value. */
export function decodeHeader(v) {
  // RFC 2047 5(1): whitespace between two adjacent encoded-words is not part of the text.
  return v.replace(/(\?=)\s+(?==\?UTF-8\?)/gi, '$1').replace(/=\?UTF-8\?([QB])\?([^?]*)\?=/gi, (_, enc, text) =>
    enc.toUpperCase() === 'B' ? Buffer.from(text, 'base64').toString('utf8') : decodeQP(text.replace(/_/g, ' ')),
  )
}

/** Decode quoted-printable text (soft line breaks + =XX bytes) as UTF-8. */
export function decodeQP(s) {
  const bytes = []
  const t = s.replace(/=\r?\n/g, '')
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(t.slice(i + 1, i + 3))) {
      bytes.push(parseInt(t.slice(i + 1, i + 3), 16))
      i += 2
    } else bytes.push(...Buffer.from(t[i], 'utf8'))
  }
  return Buffer.from(bytes).toString('utf8')
}

/** Header block + a searchable, fully decoded body from a raw message. */
export function parseRaw(raw) {
  const split = raw.indexOf('\r\n\r\n')
  const headerText = raw.slice(0, split).replace(/\r\n[ \t]+/g, ' ') // unfold
  const headers = {}
  for (const l of headerText.split('\r\n')) {
    const i = l.indexOf(':')
    if (i > 0) (headers[l.slice(0, i).toLowerCase()] ||= []).push(decodeHeader(l.slice(i + 1).trim()))
  }
  // Bodies are multipart/alternative with quoted-printable or base64 parts: decode each one.
  const body = raw.slice(split + 4)
  const parts = body.split(/\r\n(?=--)/).map((part) => {
    const [h, ...rest] = part.split('\r\n\r\n')
    const content = rest.join('\r\n\r\n')
    let decoded = content
    if (/content-transfer-encoding:\s*base64/i.test(h)) decoded = Buffer.from(content.replace(/\s+/g, ''), 'base64').toString('utf8')
    else if (/content-transfer-encoding:\s*quoted-printable/i.test(h)) decoded = decodeQP(content)
    const type = /content-type:\s*text\/(html|plain)/i.exec(h)?.[1]?.toLowerCase()
    return { type, content: decoded }
  })
  const partOf = (type) => parts.find((p) => p.type === type)?.content ?? ''
  return { headers, headerText, body: parts.map((p) => p.content).join('\n'), html: partOf('html'), text: partOf('plain') }
}
