import sha256 from 'crypto-js/sha256'
import stringify from 'fast-json-stable-stringify'
import CryptoJS from 'crypto-js'

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

/**
 * 获取指定长度的随机字符串
 * @param { Number } len 随机字符串的长度
 * @returns { str }
 */
const randomString = (len) => {
  len = len || 32
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
  const maxPos = $chars.length
  let str = ''
  for (var i = 0; i < len; i++) {
    str += $chars.charAt(Math.floor(Math.random() * maxPos))
  }

  return str
}

/**
 * 用0将key向后补齐到指定长度
 * @param {String} key 原始key
 * @param {Number} length 总长度
 * @returns pkey
 */
export const PaddingRight = (key, length) => {
  let pkey = key.toString()
  const l = pkey.length
  if (l < length) {
    pkey = pkey + new Array(length - l + 1).join('0')
  } else if (l > length) {
    pkey = pkey.slice(length)
  }
  return pkey
}

/**
 * aes-CBC-256加密
 * @param { String } content 需要加密的字符串
 * @returns secret 返回 加密后的字符串
 */
export const aesEncrypt = (content) => {
  // key: 32 bytes UTF8 string, shared between browser and server
  const key = CryptoJS.enc.Utf8.parse(PaddingRight('cloudpods', 32))
  // iv: random 16 bytes UTF8 string
  const iv = CryptoJS.enc.Utf8.parse(randomString(16))
  // msg: to encrypted UTF8 string
  const msg = CryptoJS.enc.Utf8.parse(content)

  const encrypt = CryptoJS.AES.encrypt(msg, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })

  const retHex = iv.toString(CryptoJS.enc.Hex) + CryptoJS.enc.Base64.parse(encrypt.toString()).toString(CryptoJS.enc.Hex)
  // secret: Base64 encoded string
  const secret = CryptoJS.enc.Hex.parse(retHex).toString(CryptoJS.enc.Base64)
  return secret
}

/**
 * aes-CBC-256解密
 * @param { String } secret 需要解密的字符串
 * @returns text 返回 解密后的字符串
 */
export const aesDecrypt = (secret) => {
  // key: 必须与加密时使用的key相同，32 bytes UTF8 string
  const key = CryptoJS.enc.Utf8.parse(PaddingRight('cloudpods', 32))

  // 1. 将Base64编码的secret转换为Hex
  const secretHex = CryptoJS.enc.Base64.parse(secret).toString(CryptoJS.enc.Hex)

  // 2. 提取IV（前16字节，32个Hex字符）
  const ivHex = secretHex.substring(0, 32)
  const iv = CryptoJS.enc.Hex.parse(ivHex)

  // 3. 提取加密内容（剩余部分）
  const encryptedHex = secretHex.substring(32)
  const encryptedBase64 = CryptoJS.enc.Hex.parse(encryptedHex).toString(CryptoJS.enc.Base64)

  // 4. 创建加密参数对象
  const encryptedData = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64),
  })

  // 5. 解密
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })

  // 6. 返回UTF8字符串
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * aes 对称加密
 * @param { String } content 需要加密的字符串
 * @param { String } key 加密密钥
 * @returns secret 返回 加密后的字符串
 */
export const aesEncryptWithCustomKey = (content, key) => {
  const ciphertextObj = CryptoJS.AES.encrypt(content, key)
  // 通常将密文转换为字符串存储或传输 (例如 Base64)
  const ciphertext = ciphertextObj.toString()
  return ciphertext
}

/**
 * aes 对称解密
 * @param { String } content 需要解密的字符串
 * @param { String } key 解密密钥
 * @returns secret 返回 解密后的字符串
 */
export const aesDecryptWithCustomKey = (content, key) => {
  const ciphertextObj = CryptoJS.AES.decrypt(content, key)
  const decryptedData = ciphertextObj.toString(CryptoJS.enc.Utf8)
  return decryptedData
}
