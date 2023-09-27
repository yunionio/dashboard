export function removeHttp (url) {
  return url.replace(/^https?:\/\//, '')
}
