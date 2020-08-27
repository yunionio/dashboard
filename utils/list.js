/**
 * List manager
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2018/08/07
 */
import Vue from 'vue'
import * as R from 'ramda'
import _ from 'lodash'
import { Manager } from '@/utils/manager'
import storage from '@/utils/storage'
import { isUserTag } from '@/utils/common/tag'
import i18n from '@/locales'

const STORAGE_LIST_LIMIT_KEY = '__oc_list_limit__'

class WaitStatusJob {
  constructor (status, data) {
    this.status = status
    this.data = data
    this.timer = null
  }

  /**
   * @description 清除定时器
   * @memberof WaitStatusJob
   */
  clearTimer () {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /**
   * @description 设置定时器进行状态检测
   * @memberof WaitStatusJob
   */
  start () {
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.checkStatus()
    }, this.data.list.refreshInterval * 1000)
  }

  /**
   * @description 获取新数据，进行状态检测
   * @memberof WaitStatusJob
   */
  async checkStatus () {
    if (!this.data.list.manager) return
    const params = this.data.list.params
    if (!R.isEmpty(this.data.list.itemGetParams)) {
      for (const key in this.data.list.itemGetParams) {
        const val = this.data.list.itemGetParams[key]
        if (val) {
          params[key] = val
        } else {
          params[key] = this.data.data[key]
        }
      }
    }
    delete params.offset
    delete params.limit
    try {
      const { data = {} } = await this.data.list.manager.get({
        id: this.data.id,
        params,
      })
      this.data.data = data
      const isSteadyStatus = this.data.isSteadyStatus(this.status)
      if (!isSteadyStatus) {
        this.start()
      } else {
        this.clearTimer()
      }
    } catch (error) {
      if (error.response.status === 404) {
        this.data.list.refresh()
        this.clearTimer()
      } else {
        this.data.setError(error)
        this.clearTimer()
      }
    }
  }
}

class DataWrap {
  constructor (list, data, idKey, index) {
    this.list = list
    this.id = data[idKey]
    this.data = data
    this.index = index
    this.error = null
  }

  /**
   * @description 开始轮询检测状态
   * @param {Object} steadyStatus
   * @memberof DataWrap
   */
  waitStatus (steadyStatus) {
    this.wait = new WaitStatusJob(steadyStatus, this)
    this.wait.start()
  }

  /**
   * @description 清除定时器，供List调用
   * @memberof DataWrap
   */
  clearWaitJob () {
    if (this.wait) {
      this.wait.clearTimer()
    }
  }

  /**
   * @description 设置数据错误信息，供WaitStatusJob调用
   * @param {Error} error
   * @memberof DataWrap
   */
  setError (error) {
    this.error = error
  }

  /**
   * @description 检测状态
   * @param {Object} steadyStatus
   * @returns {Boolean}
   * @memberof DataWrap
   */
  isSteadyStatus (steadyStatus) {
    let isSteadyStatus = true
    for (const key in steadyStatus) {
      const status = steadyStatus[key]
      if (R.is(Function, status)) {
        isSteadyStatus = !status(this.data)
        return isSteadyStatus
      }
      const currentStatus = _.get(this.data, key)
      if (
        (R.is(String, status) && status === currentStatus) ||
        (R.is(Array, status) && status.includes(currentStatus)) ||
        /fail/.test(currentStatus)
      ) {
        isSteadyStatus = true
      } else {
        isSteadyStatus = false
        return isSteadyStatus
      }
    }
    return isSteadyStatus
  }
}

class CreateList {
  constructor (templateContext, {
    id,
    resource,
    apiVersion = 'v2',
    ctx,
    getParams,
    limit = 20,
    idKey = 'id',
    filterOptions,
    filter = {},
    // 期望的状态，如果不符合预期，则进行定时更新
    steadyStatus = null,
    // 定时更新间隔时间，默认10s
    refreshInterval = 10,
    // 定义的默认隐藏列
    hiddenColumns = [],
    // 标签的过滤项
    tagFilter = {},
    // 外传responseData
    responseData = {},
    // get status 额外参数
    itemGetParams = {},
    // 不使用localstorage中的limit参数
    disableStorageLimit = false,
    // 额外的data获取方法Object
    extraDataFecther = {},
  }) {
    // 列表唯一标识
    this.id = id ? `LIST_${id}` : undefined
    // vm 实例
    this.templateContext = templateContext
    this.resource = resource
    this.ctx = ctx
    this.getParams = getParams
    // 排序参数
    this.sortParams = null
    if (R.is(String, resource)) {
      this.manager = new Manager(resource, apiVersion)
    }
    this.apiVersion = apiVersion
    // 配置是否加载完成
    this.loading = false
    // 获取的数据
    this.data = {}
    // 分页信息
    this.offset = 0
    this.limit = limit
    this.total = 0
    this.nextMarker = ''
    // 选择数据
    this._selectedItems = []
    this.selected = []
    // 指定作为id的属性key值
    this.idKey = idKey
    // 自定义过滤配置
    this.filterOptions = filterOptions
    // 存放当前过滤的条件
    this.filter = filter
    this.steadyStatus = this.genSteadyStatus(steadyStatus)
    this.refreshInterval = refreshInterval
    // 用于存放自定义列表的配置
    this.config = {
      hiddenColumns: hiddenColumns,
      showTagKeys: [],
    }
    // 列表配置是否已经加载过
    this.configLoaded = false
    // 标签的过滤项
    this.tagFilter = tagFilter
    // 外传responseData
    this.responseData = responseData
    // 初始化 params
    this.params = {}
    // 特殊根据某条数据进行get时的参数，如 k8s/deployment/list
    this.itemGetParams = itemGetParams
    this.disableStorageLimit = disableStorageLimit
    // extraDataFecther
    this.extraDataFecther = extraDataFecther
    this.extraData = {}
  }

  // 重写selectedItems getter和setter
  get selectedItems () {
    const items = []
    R.forEach(id => {
      items.push(this.data[id].data)
    }, this.selected)
    this._selectedItems = items
    return items
  }

  set selectedItems (items) {
    this._selectedItems = items
  }

  /**
   * @description 获取列表配置，如果没有则创建
   */
  async fetchConfig () {
    const manager = new Manager('parameters', 'v1')
    try {
      const response = await manager.get({ id: this.id })
      if (response.data && response.data.value) {
        // 如果没有设置过隐藏列，则设置默认的隐藏列
        if (response.data.update_version === 0) {
          response.data.value.hiddenColumns = this.config.hiddenColumns
        }
        this.config = response.data.value
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        await manager.create({
          data: {
            name: this.id,
            value: this.config,
          },
        })
      }
    } finally {
      this.configLoaded = true
    }
  }

  /**
   * @description 更新列表配置
   * @param {Object} 需要更新的数据
   */
  async updateConfig (value) {
    const manager = new Manager('parameters', 'v1')
    try {
      const response = await manager.update({
        id: this.id,
        data: {
          value,
        },
      })
      if (response.data && response.data.value) {
        this.config = response.data.value
      }
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * @description 重置数据
   * @memberof CreateList
   */
  reset () {
    this.clearWaitJob()
    // 复位分页信息
    this.total = 0
    this.offset = 0
    this.nextMarker = ''
    // 重置数据
    this.data = {}
    this.clearSelected()
  }

  async fetchData (offset, limit) {
    this.loading = true
    this.params = this.genParams(offset, limit)
    try {
      // 如果有id并且没有获取过列表配置则获取列表配置
      if (this.id) {
        if (!this.configLoaded) {
          await this.fetchConfig()
        }
      } else {
        this.configLoaded = true
      }
      let response
      if (this.responseData && this.responseData.data) {
        response = { data: this.responseData }
      } else if (R.is(String, this.resource)) {
        response = await this.manager.list({
          params: this.params,
          ctx: this.ctx,
        })
      } else {
        response = await this.resource(this.params)
      }
      if (this.templateContext._isDestroyed) return
      const {
        data: {
          data = [],
          total = 0,
          limit: responseLimit,
          offset: responseOffset = 0,
        },
      } = response
      this.clearWaitJob()
      if (response.data.marker_order) {
        this.data = Object.assign({}, this.wrapData(data), this.data)
      } else {
        this.data = this.wrapData(data)
      }
      this.nextMarker = response.data.next_marker
      this.syncSelected()
      this.checkSteadyStatus()
      this.total = total
      if (responseLimit > 0) {
        this.offset = responseOffset
      } else {
        this.offset = 0
      }
      if (!R.isNil(this.extraDataFecther) && !R.isEmpty(this.extraDataFecther)) {
        for (const key in this.extraDataFecther) {
          this.extraDataFecther[key](response.data, this.params).then(extraResponse => {
            Vue.set(this.extraData, key, extraResponse.data)
          }).catch((error) => {
            console.error(`get ${key} data error: ${error}`)
          })
        }
      }
      return response.data
    } catch (error) {
      throw error
    } finally {
      this.loaded = true
      this.loading = false
    }
  }

  /**
   * @description 获取选择项的详情信息
   * @memberof CreateList
   */
  async fetchSelectedDetails (ids = this.selected, params) {
    try {
      const response = await this.manager.batchGet({
        id: ids,
        params,
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  /**
   * @description 因为selectedItems的getter是根据selected生成的，所以在数据刷新后需要同步selected，避免有留下的脏数据
   * @memberof CreateList
   */
  syncSelected () {
    const newSelected = [...this.selected]
    for (let i = 0, len = this.selected.length; i < len; i++) {
      const key = this.selected[i]
      if (!this.data[key]) {
        const index = R.indexOf(key, newSelected)
        newSelected.splice(index, 1)
      }
    }
    this.selected = newSelected
  }

  /**
   * @description 刷新数据，不改变当前页数和条数
   * @memberof CreateList
   */
  refresh () {
    this.fetchData(this.offset, this.getLimit())
  }

  /**
   * @description 更新排序
   * @param {String} property 排序的key
   * @param {String} order 排序方式
   */
  doSort (property, order) {
    this.sortParams = null
    if (!order) {
      this.refresh()
      return
    }
    let params
    if (isUserTag(property)) {
      params = {
        order_by_tag: `${property}:${order.toUpperCase()}`,
      }
    } else {
      params = {
        order_by: property,
        order,
      }
    }
    this.sortParams = params
    this.refresh()
  }

  /**
   * @description 获取api资源相关的参数
   * @memberof CreateList
   */
  getOptionParams () {
    if (R.is(Function, this.getParams)) {
      return this.getParams() || {}
    }
    return this.getParams || {}
  }

  /**
   * @description 生成所有的请求参数
   * @param {Number} offset
   * @param {Number} limit
   * @returns {Object}
   * @memberof CreateList
   */
  genParams (offset, limit) {
    let params = {
      scope: this.templateContext.$store.getters.scope,
      show_fail_reason: true,
      ...this.getOptionParams(),
    }
    if (limit) {
      params.limit = limit
    } else {
      params.limit = this.getLimit()
    }
    if (offset) params.offset = offset
    params = {
      ...params,
      ...this.genFilterParams(params),
    }
    if (!R.isEmpty(this.tagFilter) && !R.isNil(this.tagFilter)) {
      params = {
        ...params,
        ...this.genTagFilterParams(params),
      }
    }
    if (this.sortParams) {
      params = {
        ...params,
        ...this.sortParams,
      }
    }
    // 加载更多类型分页的列表
    if (this.nextMarker) {
      params.paging_marker = this.nextMarker
      delete params.limit
      delete params.offset
    }
    return params
  }

  /**
   * @description 生成期望的状态数据结构
   * @param {Array | String | Object} steadyStatus
   * @returns {Object}
   * @memberof CreateList
   */
  genSteadyStatus (steadyStatus) {
    if (R.is(Array, steadyStatus) || R.is(String, steadyStatus)) {
      return {
        status: steadyStatus,
      }
    }
    return steadyStatus
  }

  /**
   * @description 获取每页请求条数
   * @returns { Number }
   * @memberof CreateList
   */
  getLimit () {
    if (!this.disableStorageLimit) {
      const limit = storage.get(STORAGE_LIST_LIMIT_KEY)
      return limit || this.limit
    }
    return this.limit
  }

  /**
   * @description 包装返回数据
   * @param {Array} arr
   * @returns {Object}
   * @memberof CreateList
   */
  wrapData (arr) {
    const data = {}
    let dataLength = 0
    if (this.nextMarker && !R.isEmpty(this.data)) {
      dataLength = Object.keys(this.data).length
    }
    for (let i = 0, len = arr.length; i < len; i++) {
      const item = arr[i]
      data[item[this.idKey]] = new DataWrap(this, item, this.idKey, i + dataLength)
    }
    return data
  }

  /**
   * @description 设置单挑数据的数据
   * @param {String} id
   * @param {Object} data
   * @memberof CreateList
   */
  update (id, data) {
    const item = this.data[id]
    item.data = data
  }

  /**
   * @description 设置单条数据的Error
   * @param {String} id
   * @param {Error} error
   * @memberof CreateList
   */
  setError (id, error) {
    const item = this.data[id]
    item.error = error
  }

  /**
   * @description 改变单条数据的期望状态，重新进行定时更新
   * @param {String} id
   * @param {String | Array | Object} steadyStatus
   * @memberof CreateList
   */
  waitStatus (id, steadyStatus) {
    steadyStatus = this.genSteadyStatus(steadyStatus)
    const item = this.data[id]
    if (item.wait) {
      item.wait.status = steadyStatus
      item.wait.start()
    } else {
      item.waitStatus(steadyStatus)
    }
  }

  /**
   * @description 检查期望状态，是否需要轮询更新
   * @memberof CreateList
   */
  checkSteadyStatus () {
    if (
      (R.isNil(this.steadyStatus) || R.isEmpty(this.steadyStatus)) ||
      (R.isNil(this.data) || R.isEmpty(this.data))
    ) return
    for (const key in this.data) {
      const item = this.data[key]
      const isSteadyStatus = item.isSteadyStatus(this.steadyStatus)
      if (!isSteadyStatus) {
        item.waitStatus(this.steadyStatus)
      }
    }
  }

  /**
   * @description 清除轮询更新
   * @memberof CreateList
   */
  clearWaitJob () {
    if (
      (R.isNil(this.steadyStatus) || R.isEmpty(this.steadyStatus)) ||
      (R.isNil(this.data) || R.isEmpty(this.data))
    ) return
    for (const key in this.data) {
      const item = this.data[key]
      item.clearWaitJob()
    }
  }

  /**
   * @description 变更当前页
   * @param {Number} currentPage
   * @memberof CreateList
   */
  changeCurrentPage (currentPage) {
    const limit = this.getLimit()
    const offset = (currentPage - 1) * limit
    this.fetchData(offset, limit)
  }

  /**
   * @description 变更当前条数
   * @param {Number} pageSize
   * @memberof CreateList
   */
  changePageSize (pageSize) {
    storage.set(STORAGE_LIST_LIMIT_KEY, pageSize)
    const offset = Math.floor(this.offset / pageSize) * pageSize
    this.limit = pageSize
    this.fetchData(offset, pageSize)
  }

  /**
   * @description nextMarker加载更多
   */
  changeNextMarker () {
    this.fetchData()
  }

  /**
   * @description 过滤条件变更
   * @param {*} filter
   * @memberof CreateList
   */
  changeFilter (filter) {
    this.filter = filter
    this.reset()
    this.fetchData(0, 0)
  }

  /**
   * @description 标签过滤条件变更
   * @param {*} tagFilter
   * @memberof CreateList
   */
  changeTagFilter (tagFilter) {
    this.tagFilter = tagFilter
    this.reset()
    this.fetchData(0, 0)
  }

  /**
   * @description 勾选的数据发生改变事件
   *
   * @param {*} selection
   * @memberof CreateList
   */
  changeSelected (selection) {
    const ids = []
    for (let i = 0, len = selection.length; i < len; i++) {
      ids.push(selection[i][this.idKey])
    }
    this.selectedItems = selection
    this.selected = ids
  }

  /**
   * @description 清空勾选的数据
   * @memberof CreateList
   */
  clearSelected () {
    this.selectedItems = []
    this.selected = []
  }

  /**
   * @description 生成自定义filter的params
   *
   * @param {Object} params
   * @returns {Object}
   * @memberof CreateList
   */
  genFilterParams (params) {
    const ret = {}
    const filters = []
    const jointFilters = []
    // 查找已经存在的filter和自定义filter做合并
    for (const key in params) {
      if (key === 'filter') {
        filters.push(params[key])
      }
    }
    // 生成自定义过滤的params
    for (const key in this.filter) {
      const option = this.filterOptions[key]
      let val = this.filter[key]
      if (option.formatter) {
        val = option.formatter(val)
      }
      if (option.filter) {
        if (option.jointFilter) {
          jointFilters.push(val)
        } else {
          filters.push(val)
        }
      } else {
        ret[key] = val
      }
    }
    if (filters.length > 0) {
      ret.filter = filters
    }
    if (jointFilters.length > 0) {
      ret.joint_filter = jointFilters
    }
    return ret
  }

  /**
   * @description 生成标签过滤的params
   *
   * @param {Object} params
   * @returns {Object}
   * @memberof CreateList
   */
  genTagFilterParams (params) {
    const ret = {}
    let index = 0
    R.forEachObjIndexed((value, key) => {
      if (key === 'without_user_meta' && (value && value[0] === true)) {
        ret.without_user_meta = true
      } else {
        ret[`tags.${index}.key`] = []
        let len = 1
        if (value && value.length) len = value.length
        for (let i = 0; i < len; i++) {
          ret[`tags.${index}.key`].push(key)
        }
        ret[`tags.${index}.value`] = value
        index++
      }
    }, this.tagFilter)
    return ret
  }

  /**
   * @description 是否允许删除
   **/
  allowDelete () {
    if (this.selectedItems.length <= 0) {
      return false
    }
    for (let i = 0, len = this.selectedItems.length; i < len; i++) {
      const { disable_delete: disableDelete, can_delete: canDelete } = this.selectedItems[i]
      if (R.is(Boolean, disableDelete) && disableDelete) {
        return false
      } else if (R.is(Boolean, canDelete) && !canDelete) {
        return false
      }
    }
    return true
  }

  /**
   * @description 对应 manager 里面的 performAction 方法
   *
   * @param {String} action
   * @param {Object} data
   * @param {Array} steadyStatus 期待状态
   * @returns Promise
   * @memberof CreateList
   */
  singlePerformAction (action, data, steadyStatus) {
    const id = data.id
    delete data.id
    return this.onManager('performAction', {
      id,
      steadyStatus,
      managerArgs: {
        action,
        data,
      },
    })
  }

  batchPerformAction (action, data, steadyStatus, selectedIds = this.selected) {
    if (steadyStatus) {
      for (let i = 0, len = selectedIds.length; i < len; i++) {
        const idstr = selectedIds[i]
        this.waitStatus(idstr, steadyStatus)
      }
    }
    return this.onManager('batchPerformAction', {
      id: selectedIds,
      steadyStatus,
      managerArgs: {
        action,
        data,
      },
    })
  }

  /**
   *
   * 刷新单条数据
   * @param {String} id
   * @param {Array} steadyStatus 所期望的状态，以便定时更新
   * @returns Promise
   */
  singleRefresh (id, steadyStatus) {
    const params = { ...this.params }
    delete params.offset
    delete params.limit
    return this.manager.get({
      id,
      params,
    }).then(response => {
      this.update(id, response.data)
      if (steadyStatus) {
        this.waitStatus(id, steadyStatus)
      }
      return response
    })
  }

  /**
   * @description 对应 manager 里面的 update 方法
   *
   * @param {String} id
   * @param {Object} data
   * @param {Array} steadyStatus 期待状态
   * @returns Promise
   * @memberof CreateList
   */
  singleUpdate (id, data, steadyStatus) {
    return this.onManager('update', {
      id,
      steadyStatus,
      managerArgs: {
        data,
      },
    })
  }

  batchUpdate (selectedIds = this.selected, data, steadyStatus) {
    if (steadyStatus) {
      for (let i = 0, len = selectedIds.length; i < len; i++) {
        const idstr = selectedIds[i]
        this.waitStatus(idstr, steadyStatus)
      }
    }
    return this.onManager('batchUpdate', {
      id: selectedIds,
      steadyStatus,
      managerArgs: {
        data,
      },
    })
  }

  /**
   * @description 调用manager方法的桥接方法，调用此方法可以同时更新 list 的对应数据
   * @param {String} on manager 的实例方法
   * @param {Object} opts
   * opts.expectStatus (String || Array || Object) 期望状态
   * opts.id (String || Array)
   * opts.managerArs (Array) 按照指定的 manager 实例方法所需参数顺序传入
   */
  onManager (on, opts) {
    if (!this.manager) return Promise.resolve()
    let {
      steadyStatus,
      id: ids = this.selected,
      managerArgs = {},
    } = opts
    const refreshActions = ['create', 'delete', 'batchDelete']
    if (R.is(Array, ids)) {
      if (!managerArgs.ids) managerArgs.ids = ids
    } else {
      if (!managerArgs.id) managerArgs.id = ids
      ids = [ids]
    }
    if (!managerArgs) {
      throw Error(i18n.t('common_74'))
    }
    if (!R.is(Object, managerArgs)) {
      throw Error(i18n.t('common_75'))
    }
    const promise = this.manager[on]({ ...managerArgs }).then(res => {
      if (refreshActions.includes(on)) {
        this.refresh()
        return res
      }
      let isBatch = false
      if (R.is(Array, res.data.data) && on !== 'getSpecific') {
        isBatch = true
      }
      if (on !== 'get') {
        if (isBatch) {
          for (let i = 0, len = res.data.data.length; i < len; i++) {
            const rec = res.data.data[i]
            if (rec.status < 400) {
              // success
              this.update(rec[this.idKey], rec.data)
            } else {
              // failure
              this.setError(rec[this.idKey], res)
            }
          }
        } else {
          if (res.status < 400) {
            if (on !== 'getSpecific') this.update(ids[0], res.data)
          } else {
            this.setError(ids[0], res)
          }
        }
      }
      if (steadyStatus) {
        for (let i = 0, len = ids.length; i < len; i++) {
          const id = ids[i]
          this.waitStatus(id, steadyStatus)
        }
      }
      return res
    }).catch(err => {
      return Promise.reject(err)
    })
    return promise
  }
}

export default {
  createList (templateContext, options = {}) {
    return new CreateList(templateContext, options)
  },
}
