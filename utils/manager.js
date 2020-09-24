import qs from 'qs'
import Vue from 'vue'
import { camel2Words } from './utils'

export class UnknownRpcMethodException {
  constructor (method) {
    this.method = method
  }
}

export class UnknownCsrfMethodException {
  constructor (method) {
    this.method = method
  }
}

export class Manager {
  constructor (res, apiVer) {
    this.resource = res
    if (apiVer) {
      this.apiVersion = apiVer
    } else {
      this.apiVersion = 'v2'
    }
  }

  contextPath (ctx) {
    let path = '/' + this.apiVersion + '/'
    for (let i = 0; i < ctx.length; i++) {
      path += `${ctx[i][0]}/${ctx[i][1]}/`
    }
    return path
  }

  get ({ id, params, ctx = [] } = {}) {
    return Vue.http.get(`${this.contextPath(ctx)}${this.resource}/${id}`, { params })
  }

  batchGet ({ id, params = {}, ctx = [] } = {}) {
    return Vue.http.get(`${this.contextPath(ctx)}${this.resource}`, { params: Object.assign(params, { id, batchGet: true }) })
  }

  getSpecific ({ id, spec, params, ctx = [] } = {}) {
    return Vue.http.get(`${this.contextPath(ctx)}${this.resource}/${id}/${spec}`, { params })
  }

  list ({ params, ctx = [], cancelToken } = {}) {
    return Vue.http.get(`${this.contextPath(ctx)}${this.resource}`, { params, cancelToken })
  }

  create ({ data, ctx = [], params } = {}) {
    return Vue.http.post(`${this.contextPath(ctx)}${this.resource}`, data, { params })
  }

  batchCreate ({ data, count, ctx = [] } = {}) {
    data.__count__ = count
    return Vue.http.post(`${this.contextPath(ctx)}${this.resource}`, data)
  }

  batchPost ({ ids, data, ctx = [] } = {}) {
    return Vue.http.post(`${this.contextPath(ctx)}${this.resource}`, data, { params: { id: ids } })
  }

  update ({ id, data, ctx = [] } = {}) {
    return Vue.http.put(`${this.contextPath(ctx)}${this.resource}/${id}`, data)
  }

  batchUpdate ({ ids, data, ctx = [], params = {} } = {}) {
    return Vue.http.put(`${this.contextPath(ctx)}${this.resource}`, data, { params: { id: ids, ...params } })
  }

  patch ({ id, data, ctx = [], params } = {}) {
    return Vue.http.patch(`${this.contextPath(ctx)}${this.resource}/${id}`, data, { params })
  }

  batchPatch ({ ids, data, ctx = [] } = {}) {
    return Vue.http.patch(`${this.contextPath(ctx)}${this.resource}`, data, { params: { id: ids } })
  }

  delete ({ id, ctx = [] } = {}) {
    return Vue.http.delete(`${this.contextPath(ctx)}${this.resource}/${id}`)
  }

  batchDelete ({ ids, ctx = [], data, params = {} } = {}) {
    return Vue.http.delete(`${this.contextPath(ctx)}${this.resource}`, { params: { id: ids, ...params }, data })
  }

  performAction ({ id, action, data, params = {}, ctx = [] } = {}) {
    return Vue.http.post(`${this.contextPath(ctx)}${this.resource}/${id}/${action}`, data, { params })
  }

  performClassAction ({ action, data, params = {}, ctx = [] } = {}) {
    return Vue.http.post(`${this.contextPath(ctx)}${this.resource}/${action}`, data, { params })
  }

  batchPerformAction ({ ids, action, data, ctx = [] } = {}) {
    return Vue.http.post(`${this.contextPath(ctx)}${this.resource}/${action}`, data, { params: { id: ids } })
  }

  objectRpc ({ methodname, objId, params } = {}) {
    const words = camel2Words(methodname)
    if (words[0] === 'get') {
      return this._rpcGet({
        id: objId,
        words: words.slice(1),
        params,
      })
    } else if (words[0] === 'post' || words[0] === 'do') {
      return this._rpcPost({
        id: objId,
        words: words.slice(1),
        params,
      })
    } else {
      throw new UnknownRpcMethodException(words[0])
    }
  }

  rpc ({ methodname, params } = {}) {
    const words = camel2Words(methodname)
    if (words[0] === 'get') {
      return this._rpcGet({
        id: null,
        words: words.slice(1),
        params,
      })
    } else if (words[0] === 'post' || words[0] === 'do') {
      return this._rpcPost({
        id: null,
        words: words.slice(1),
        params,
      })
    } else {
      throw new UnknownRpcMethodException(words[0])
    }
  }

  _rpcURL ({ id, words } = {}) {
    let url = '/' + this.apiVersion + '/rpc/' + this.resource + '/'
    if (id) {
      url += id + '/'
    }
    url += words.join('-')
    return url
  }

  _rpcGet ({ id, words, params } = {}) {
    const url = this._rpcURL({ id, words })
    // const _qs = qs.stringify(params)
    // console.log(_qs)
    // if (_qs) {
    //   url += '?' + _qs
    // }
    return Vue.http.get(url, { params })
  }

  _rpcPost ({ id, words, params } = {}) {
    const url = this._rpcURL({ id, words })
    return Vue.http.post(url, params)
  }

  objectCsrf ({ methodname, objId, params } = {}) {
    const words = camel2Words(methodname)
    if (words[0] === 'get') {
      return this._csrfGet({
        id: objId,
        words: words.slice(1),
        params,
      })
    } else if (words[0] === 'post' || words[0] === 'do') {
      return this._csrfPost({
        id: objId,
        words: words.slice(1),
        params,
      })
    } else {
      throw new UnknownCsrfMethodException(words[0])
    }
  }

  csrf ({ methodname, params } = {}) {
    const words = camel2Words(methodname)
    if (words[0] === 'get') {
      return this._csrfGet({
        id: null,
        words: words.slice(1),
        params,
      })
    } else if (words[0] === 'post' || words[0] === 'do') {
      return this._csrfPost({
        id: null,
        words: words.slice(1),
        params,
      })
    } else {
      throw new UnknownCsrfMethodException(words[0])
    }
  }

  _csrfURL ({ id, words } = {}) {
    let url = '/' + this.apiVersion + '/csrf/' + this.resource + '/'
    if (id) {
      url += id
    }
    url += words.join('-')
    return url
  }

  _csrfGet ({ id, words, params } = {}) {
    let url = this._csrfURL({ id, words })
    const _qs = qs.stringify(params)
    if (_qs) {
      url += '?' + _qs
    }
    return Vue.http.get(url)
  }

  _csrfPost ({ id, words, params } = {}) {
    const url = this._csrfURL({ id, words })
    return Vue.http.post(url, params)
  }
}
