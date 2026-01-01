export function truncate(str, maxLength) {
  if (typeof str !== 'string') {
    throw new TypeError('truncate expects string')
  }

  if (str.length <= maxLength) {
    return str
  }

  return str.slice(0, maxLength) + '...'
}
