import sha256 from 'crypto-js/sha256'
import stringify from 'fast-json-stable-stringify'

export const getSignature = data => {
  if (!data.signature) {
    return sha256(stringify(data)).toString()
  } else {
    console.error(`crypto: ${data} already has "signature"`)
    return data
  }
}
