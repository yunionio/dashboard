import Cookies from 'js-cookie'
import { Base64 } from 'js-base64'
import axios from 'axios'

const ONECLOUD_AUTH_KEY = 'yunionauth'
const AUTH_API_VERSION = 'v1'

export function getToken () {
  return Cookies.get(ONECLOUD_AUTH_KEY)
}

export function setToken (token) {
  return Cookies.set(ONECLOUD_AUTH_KEY, token)
}

export function removeToken () {
  return Cookies.remove(ONECLOUD_AUTH_KEY)
}

export function decodeToken (token) {
  if (token) {
    const auth = Base64.decode(token)
    if (auth) {
      return JSON.parse(auth)
    }
  }
  return null
}

export function logout () {
  return axios({
    url: `/${AUTH_API_VERSION}/auth/logout`,
    method: 'POST',
  })
}
