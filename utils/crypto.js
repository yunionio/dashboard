import sha256 from 'crypto-js/sha256'
import stringify from 'fast-json-stable-stringify'

export const getSignature = data => {
  return sha256(stringify(data)).toString()
}
