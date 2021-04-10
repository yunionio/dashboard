import qs from 'qs'
import get from 'lodash/get'
import { Manager } from '@/utils/manager'
import http from '@/utils/http'

// 缓存
let _cache = {}
// 队列
let _queue = {}

export function load ({
  res,
  action,
  apiVersion = 'v2',
  resPath,
  actionArgs = {},
  useManager = true,
}) {
  return new Promise((resolve, reject) => {
    // 根据params和res生成唯一key
    const _params = { ...actionArgs.params }
    const _data = { ...actionArgs.data }
    const requestMethod = actionArgs.method || 'GET'
    if (_params.$t) delete _params.$t
    const stringifyKey = qs.stringify(requestMethod === 'GET' ? _params : _data)
    let key = `${res}$$${stringifyKey}`
    if (!useManager && actionArgs.url) {
      key = `${res}$$${actionArgs.url}$$${stringifyKey}`
    }
    const value = _cache[key]
    // 有数据则直接返回
    if (value) {
      return resolve(value)
    }
    // 无数据加入请求队列并缓存
    if (_queue[key]) {
      _queue[key].add(resolve, reject)
    } else {
      _queue[key] = new Loader({ key, res, action, apiVersion, resolve, reject, actionArgs, resPath, useManager })
      setTimeout(() => {
        _queue[key] && _queue[key].load()
      }, 100)
    }
  })
}

export function clear () {
  _cache = {}
  _queue = {}
}

class Loader {
  constructor ({ key, res, action, apiVersion, resolve, reject, actionArgs, resPath, useManager }) {
    this.key = key
    this.res = res
    this.action = action
    this.queue = [[resolve, reject]]
    this.apiVersion = apiVersion
    this.actionArgs = actionArgs
    this.resPath = resPath
    this.useManager = useManager
  }

  add (resolve, reject) {
    this.queue.push([resolve, reject])
  }

  async load () {
    let manager
    try {
      let response
      if (this.useManager) {
        manager = new Manager(this.res, this.apiVersion)
        response = await manager[this.action](this.actionArgs)
      } else {
        response = await http(this.actionArgs)
      }
      const data = get(response, this.resPath)
      _cache[this.key] = data
      for (let i = 0; i < this.queue.length; i++) {
        const cb = this.queue[i]
        cb[0](data)
      }
      delete _queue[this.key]
      return data
    } catch (error) {
      for (let i = 0; i < this.queue.length; i++) {
        const cb = this.queue[i]
        cb[1](error)
      }
      delete _queue[this.key]
      throw error
    } finally {
      manager = null
    }
  }
}
