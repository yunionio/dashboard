import sha256 from 'crypto-js/sha256'
import stringify from 'fast-json-stable-stringify'

function sortDict (data) {
  const sorted = {}
  Object.keys(data).sort().map((k) => { sorted[k] = data[k] })
  return sorted
}

export const getSignature = data => {
  if (!data.signature) {
    return sha256(stringify(sortDict(data))).toString()
  } else {
    console.error(`crypto: ${data} already has "signature"`)
    return data
  }
}
