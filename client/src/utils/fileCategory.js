import { FileAudio, FileVideo, FileImage, FileType, FileText, File } from 'lucide-react'

/**
 * Maps each All Files category (mirrors `categoryOfMime` in
 * server/src/controllers/fileController.js) to an icon + accent color — same
 * "category → icon/color" pattern already used for report types in
 * `utils/reportCategory.js`.
 */
export const FILE_CATEGORY_ICON = {
  audio: { icon: FileAudio, color: 'coral', label: 'Audio' },
  video: { icon: FileVideo, color: 'purple', label: 'Video' },
  image: { icon: FileImage, color: 'sky', label: 'Image' },
  pdf: { icon: FileType, color: 'rose', label: 'PDF' },
  docx: { icon: FileText, color: 'royal', label: 'DOCX' },
  document: { icon: File, color: 'mint', label: 'Document' },
  report: { icon: FileText, color: 'royal', label: 'Report' },
}

export const fileCategoryIcon = (category) => FILE_CATEGORY_ICON[category] || FILE_CATEGORY_ICON.document
