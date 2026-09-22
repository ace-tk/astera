/** A failure with an HTTP status and a stable machine-readable code. */
export class CmsError extends Error {
  constructor(status, code, message, issues) {
    super(message)
    this.status = status
    this.code = code
    this.issues = issues
  }
}
