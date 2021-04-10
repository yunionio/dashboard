import * as R from 'ramda'
import jsrsasign from 'jsrsasign'

function byte2hex (b) {
  b &= 0x000000FF
  if (b < 0) {
    b += 256
  }
  let hex = b.toString(16)
  if (hex[0] === '-') {
    alert(hex)
  }
  if (hex.length === 0) {
    hex = '00'
  } else if (hex.length === 1) {
    hex = '0' + hex
  } else if (hex.length > 2) {
    alert(b + '?' + hex)
  }
  return hex
}

function int2hex (val) {
  val &= 0xFFFFFFFF
  if (val < 0) {
    val += 0x100000000
  }
  const hex = val.toString(16).toUpperCase()
  return ('00000000' + hex).slice(-8)
}

function byteArray2hex (arr) {
  let result = ''
  for (const i in arr) {
    result += byte2hex(arr[i])
  }
  return result
}

function stoAesKey (key) {
  var keylen = 32
  while (key.length < keylen) {
    key += '$'
  }
  if (key.length > keylen) {
    key = key.substring(0, keylen)
  }
  return jsrsasign.CryptoJS.enc.Hex.parse(byteArray2hex(jsrsasign.stoBA(key)))
}

function aesDecrypt (data, key) {
  const iv = jsrsasign.CryptoJS.enc.Hex.parse(data.substring(0, 32))
  const sec = jsrsasign.CryptoJS.enc.Hex.parse(data.substring(32))
  key = stoAesKey(key)
  const encrypted = {}
  encrypted.key = key
  encrypted.iv = iv
  encrypted.ciphertext = sec
  let res = jsrsasign.CryptoJS.AES.decrypt(
    encrypted,
    key,
    {
      mode: jsrsasign.CryptoJS.mode.CFB8,
      padding: jsrsasign.CryptoJS.pad.NoPadding,
      iv: iv,
    },
  )
  res = res.toString(jsrsasign.CryptoJS.enc.Utf8)
  return res
}

function exportDsaSshPubkey (key) {
  const chunks = [
    jsrsasign.stoBA('ssh-dss'),
    key.p.toByteArray(),
    key.q.toByteArray(),
    key.g.toByteArray(),
    key.y.toByteArray(),
  ]
  let all = ''
  for (const i in chunks) {
    const chunk = chunks[i]
    all += int2hex(chunk.length)
    all += byteArray2hex(chunk)
  }
  return 'ssh-dss ' + jsrsasign.hex2b64(all)
}

export function passwordDecrypt (secret, privkey) {
  const key = jsrsasign.KEYUTIL.getKey(privkey)
  if (R.is(Function, key.decryptOAEP)) {
    return key.decryptOAEP(jsrsasign.b64tohex(secret))
  } else {
    const pubkey = exportDsaSshPubkey(key)
    return aesDecrypt(jsrsasign.b64tohex(secret), pubkey)
  }
}

jsrsasign.CryptoJS.mode.CFB8 = (function () {
  const CFB8 = jsrsasign.CryptoJS.lib.BlockCipherMode.extend()

  CFB8.Encryptor = CFB8.extend({
    processBlock: function (words, offset) {
      // Shortcuts
      const cipher = this._cipher
      const blockSize = cipher.blockSize

      _generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher, true)
    },
  })

  CFB8.Decryptor = CFB8.extend({
    processBlock: function (words, offset) {
      // Shortcuts
      const cipher = this._cipher
      const blockSize = cipher.blockSize

      _generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher, false)
    },
  })

  function _generateKeystreamAndEncrypt (words, offset, blockSize, cipher, encrypt) {
    function word2hex (val) {
      val &= 0x0FFFFFFFF
      if (val < 0) {
        val += 0x100000000
      }
      const hex = val.toString(16)
      return ('00000000' + hex).slice(-8)
    }

    function wordArray2hex (arr) {
      let str = ''
      for (let i = 0; i < arr.length; i++) {
        str += word2hex(arr[i])
      }
      return str
    }

    function hex2wordArray (hex) {
      const arr = []
      for (let j = 0; j < hex.length; j += 8) {
        let subhex
        if (hex.length - offset < 8) {
          subhex = hex.substring(j)
          subhex += '00000000'
          subhex = subhex.slice(0, 8)
        } else {
          subhex = hex.substring(j, j + 8)
        }
        arr[arr.length] = parseInt(subhex, 16)
        if ((arr[arr.length - 1] & 0x80000000) !== 0) {
          arr[arr.length - 1] -= 0x100000000
        }
      }
      return arr
    }
    let keyhex
    if (this._iv) {
      keyhex = wordArray2hex(this._iv)
      this._iv = undefined
    } else {
      keyhex = this._prevBlock
    }

    // Encrypt
    let size = blockSize
    if (size > words.length - offset) {
      size = words.length - offset
    }
    const wordhex = wordArray2hex(words.slice(offset, offset + size))
    let newwordhex = ''
    for (let i = 0; i < size * 4; i++) {
      const keystream = hex2wordArray(keyhex)
      cipher.encryptBlock(keystream, 0)
      const newkeyhex = wordArray2hex(keystream)
      const tmp = parseInt(newkeyhex.substring(0, 2), 16)
      let wordbytes = parseInt(wordhex.substring(i * 2, i * 2 + 2), 16)
      wordbytes = (wordbytes ^ tmp).toString(16)
      if (wordbytes.length === 1) {
        wordbytes = '0' + wordbytes
      }
      newwordhex += wordbytes
      if (encrypt) {
        keyhex = keyhex.substring(2) + wordbytes
      } else {
        keyhex = keyhex.substring(2) + wordhex.substring(i * 2, i * 2 + 2)
      }
    }
    const newwords = hex2wordArray(newwordhex)
    for (let i = 0; i < newwords.length; i++) {
      words[offset + i] = newwords[i]
    }

    this._prevBlock = keyhex
  }
  return CFB8
}())

jsrsasign.CryptoJS.pad.NoPadding = {
  pad: function () {
  },
  unpad: function () {
  },
}
