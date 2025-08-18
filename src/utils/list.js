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

const TAG_FILGER_KEYS = [
  'user_meta',
  'bill_tags',
  'project_tags',
  'instance_tags',
]

const mergeFilter = (params1, params2) => {
  const filter1 = params1.filter ? (R.is(Array, params1.filter) ? params1.filter : [params1.filter]) : []
  const filter2 = params2.filter ? (R.is(Array, params2.filter) ? params2.filter : [params2.filter]) : []
  return {
    ...params1,
    filter: [...filter1, filter2],
  }
}

const FULL_TAG_FILTER_KEYS = []
TAG_FILGER_KEYS.map(key => FULL_TAG_FILTER_KEYS.push(`with_${key}`, `without_${key}`))

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
    const status = this.data.data?.status
    let interval = this.data.list.refreshInterval
    if (this.data.list.refreshIntervalConfig && this.data.list.refreshIntervalConfig[this.data.list.resource] && this.data.list.refreshIntervalConfig[this.data.list.resource][status]) {
      interval = this.data.list.refreshIntervalConfig[this.data.list.resource][status]
    }
    this.timer = setTimeout(() => {
      this.checkStatus()
    }, interval * 1000)
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
        if (this.data.list.itemGetParams.hasOwnProperty(key)) {
          if (val) {
            params[key] = val
          } else {
            delete params[key]
          }
        } else {
          params[key] = this.data.data[key]
        }
      }
    }
    delete params.offset
    delete params.limit
    try {
      let response
      if (this.data.list.itemGet) {
        response = await this.data.list.itemGet(this.data.data, params)
      } else {
        response = await this.data.list.manager.get({
          id: this.data.id,
          params,
        })
      }
      const data = response.data || {}
      this.data.data = { ...data, isDataShow: true }
      const isSteadyStatus = this.data.isSteadyStatus(this.status)
      if (!isSteadyStatus) {
        this.start()
      } else {
        this.clearTimer()
      }
    } catch (error) {
      if (_.get(error, 'response.status') === 404) {
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
  constructor (
    templateContext,
    {
      id,
      resource,
      apiVersion = 'v2',
      ctx,
      getParams,
      limit = 20,
      idKey = 'id',
      exportUseIdKey = false,
      filterOptions = {},
      filter = {},
      filterCondition = {},
      autoHiddenFilterKey = '',
      // 期望的状态，如果不符合预期，则进行定时更新
      steadyStatus = null,
      // 定时更新间隔时间，默认10s
      refreshInterval = 10,
      refreshIntervalConfig = {
        servers: {
          block_stream: 3,
          snapshot_delete: 3,
        },
      },
      // 定义的默认隐藏列
      hiddenColumns = [],
      // 标签的过滤项
      tagFilter = {},
      tagFilter2 = {},
      tagFilter3 = {},
      // 标签层级过滤项
      projectTagFilter = {},
      // 外传responseData
      responseData = {},
      // get status 额外参数
      itemGetParams = {},
      // get item 自定义方法
      itemGet,
      // 不使用localstorage中的limit参数
      disableStorageLimit = false,
      // 额外的data获取方法Object
      extraDataFecther = {},
      // 重新生成list的params
      genParamsCb = null,
      // fetchData完成后的回调
      fetchDataCb = null,
      // 标识是否是预加载数据
      isPreLoad = true,
      // 无需两次加载
      noPreLoad = false,
      // 不加载详情
      noListDetails = false,
      // 批量获取item的params formatter
      batchItemGetParamsFormatter = null,
    },
  ) {
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
    this.loadMoreSize = 20
    this.nextMarker = ''
    this.pagerType = ''
    // 选择数据
    this._selectedItems = []
    this.selected = []
    // 指定作为id的属性key值
    this.idKey = idKey
    this.exportUseIdKey = exportUseIdKey
    // 自定义过滤配置
    this.filterOptions = this.genFilterOptions(filterOptions, autoHiddenFilterKey)
    // 如果有search，表示需要配置模糊匹配选项，则将模糊匹配添加上
    // if (search) {
    //   this.search = search
    //   this.filterOptions.search = {
    //     label: i18n.t('table.title.search'),
    //   }
    // }
    // 存放当前过滤的条件
    this.filter = filter
    this.steadyStatus = this.genSteadyStatus(steadyStatus)
    this.refreshInterval = refreshInterval
    this.refreshIntervalConfig = refreshIntervalConfig
    // 用于存放自定义列表的配置
    this.config = {
      hiddenColumns: hiddenColumns,
      showTagKeys: [],
      showProjectTagKeys: [],
    }
    // 列表配置是否已经加载过
    this.configLoaded = false
    // 标签的过滤项
    this.tagFilter = tagFilter
    this.tagFilter2 = tagFilter2
    this.tagFilter3 = tagFilter3
    this.projectTagFilter = projectTagFilter
    // 外传responseData
    this.responseData = responseData
    // 初始化 params
    this.params = {}
    // 特殊根据某条数据进行get时的参数，如 k8s/deployment/list
    this.itemGetParams = itemGetParams
    this.itemGet = itemGet
    this.disableStorageLimit = disableStorageLimit
    // extraDataFecther
    this.extraDataFecther = extraDataFecther
    this.extraData = {}
    this.genParamsCb = genParamsCb
    this.fetchDataCb = fetchDataCb
    this.isPreLoad = isPreLoad
    this.noPreLoad = noPreLoad
    this.noListDetails = noListDetails
    this.pinFilter = {}
    this.pinSavedFilters = {}
    // 批量轮询
    this.batchCheckStatusTimer = null
    this.batchCheckStatusList = []
    this.batchItemGetParamsFormatter = batchItemGetParamsFormatter
    this.totals = {}
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
   * @description 清除定时器
   * @memberof CreateList
   */
  clearBatchCheckStatusTimer () {
    if (this.batchCheckStatusTimer) {
      this.batchCheckStatusList = []
      clearTimeout(this.batchCheckStatusTimer)
      this.batchCheckStatusTimer = null
    }
  }

  /**
   * @description 设置定时器进行状态检测
   * @memberof CreateList
   */
  startBatchCheckStatusTimer () {
    this.clearBatchCheckStatusTimer()
    // 使用列表配置的interval 原配置是针对不同状态的，不适用
    // const status = this.data.data?.status
    // let interval = this.data.list.refreshInterval
    // if (this.data.list.refreshIntervalConfig && this.data.list.refreshIntervalConfig[this.data.list.resource] && this.data.list.refreshIntervalConfig[this.data.list.resource][status]) {
    //   interval = this.data.list.refreshIntervalConfig[this.data.list.resource][status]
    // }
    this.batchCheckStatusTimer = setTimeout(() => {
      this.batchCheckStatus()
    }, 10 * 1000)
  }

  stopBatchCheckStatusTimer () {
    if (this.batchCheckStatusTimer) {
      clearTimeout(this.batchCheckStatusTimer)
      this.batchCheckStatusTimer = null
    }
  }

  restartBatchCheckStatusTimer () {
    this.startBatchCheckStatusTimer()
  }

  /**
   * @description 获取列表中不符合steadyStatus的数据列表
   * @memberof CreateList
   */
  getAbnormalStatusList () {
    const batchCheckStatusList = []
    for (const key in this.data) {
      const item = this.data[key]
      const isSteadyStatus = item.isSteadyStatus(this.steadyStatus)
      if (!isSteadyStatus) {
        batchCheckStatusList.push(item.id)
      }
    }
    return batchCheckStatusList
  }

  /**
   * @description 批量轮询检测状态
   * @param {*} steadyStatus
   * @memberof CreateList
   */
  async batchCheckStatus () {
    if (!this.manager) return
    this.batchCheckStatusList = this.getAbnormalStatusList().filter(id => id)
    const params = this.params
    if (!R.isEmpty(this.itemGetParams)) {
      for (const key in this.itemGetParams) {
        const val = this.itemGetParams[key]
        if (this.itemGetParams.hasOwnProperty(key)) {
          if (val) {
            params[key] = val
          } else {
            delete params[key]
          }
        }
      }
    }
    delete params.offset
    delete params.limit
    try {
      const p = this.batchItemGetParamsFormatter ? this.batchItemGetParamsFormatter({
        ...params,
        id: this.batchCheckStatusList,
      }) : {
        ...params,
        id: this.batchCheckStatusList,
      }
      const response = await this.manager.list({
        params: p,
      })
      const data = response.data?.data || []
      data.forEach(item => {
        if (this.data[item[this.idKey]]) {
          this.data[item[this.idKey]] = new DataWrap(
            this,
            { ...item, isDataShow: true },
            this.idKey,
            this.data[item[this.idKey]].index,
          )
        }
      })
      // 有数据被删除了，刷新列表重新开始轮询
      if (data.length < this.batchCheckStatusList.length) {
        this.clearBatchCheckStatusTimer()
        this.batchCheckStatusList = []
        this.refresh()
        return
      }
      const batchCheckStatusList = this.getAbnormalStatusList().filter(id => id)
      this.batchCheckStatusList = batchCheckStatusList
      if (!batchCheckStatusList.length) {
        this.clearBatchCheckStatusTimer()
      } else {
        this.startBatchCheckStatusTimer()
      }
    } catch (error) {
      if (_.get(error, 'response.status') === 404) {
        this.refresh()
        this.clearBatchCheckStatusTimer()
      } else {
        this.batchCheckStatusList.forEach(id => {
          this.setError(id, error)
        })
        this.clearBatchCheckStatusTimer()
      }
    }
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
  reset (clearData) {
    this.clearWaitJob()
    this.clearBatchCheckStatusTimer()
    // 复位分页信息
    this.total = 0
    this.offset = 0
    this.nextMarker = ''
    this.clearSelected()
    // 重置数据
    if (clearData) {
      this.data = {}
      this.totals = {}
      if (R.is(Function, this.fetchDataCb)) {
        this.fetchDataCb({
          data: {
            totals: {},
            data: [],
          },
        })
      }
    }
  }

  async fetchData (offset, limit, showDetails) {
    this.loading = true
    // if (this.noPreLoad) {
    showDetails = !this.noListDetails
    // }
    this.params = this.genParams(offset, limit, showDetails)
    // if (!showDetails) this.isPreLoad = true
    this.isPreLoad = false
    try {
      const fetchList = []
      // 如果有id并且没有获取过列表配置则获取列表配置
      if (this.id) {
        if (!this.configLoaded) {
          fetchList.push(this.fetchConfig())
        }
      } else {
        this.configLoaded = true
      }
      let response
      if (this.responseData && this.responseData.data) {
        response = { data: this.responseData }
      } else if (R.is(String, this.resource)) {
        fetchList.push(this.manager.list({
          params: this.params,
          ctx: this.ctx,
        }))
      } else {
        fetchList.push(this.resource(this.params))
      }
      if (fetchList.length) {
        const res = await Promise.all(fetchList)
        if (!(this.responseData && this.responseData.data)) {
          response = res[res.length - 1]
        }
      }
      if (this.templateContext._isDestroyed) return
      const {
        data: {
          data = response.data,
          total = 0,
          limit: responseLimit,
          offset: responseOffset = 0,
        },
      } = response
      this.clearWaitJob()
      this.clearBatchCheckStatusTimer()
      let allData = {}
      if (response.data.marker_order) {
        allData = Object.assign({}, this.wrapData(data), this.data)
      } else {
        allData = this.wrapData(data)
      }
      // 分页渲染
      this.pageRender(allData)
      this.nextMarker = response.data.next_marker
      this.pagerType = response.data.marker_field ? 'loadMore' : 'pager'
      this.syncSelected()
      this.checkSteadyStatus()
      this.total = total
      if (responseLimit > 0) {
        this.offset = responseOffset
      } else {
        this.offset = 0
      }
      if (
        !R.isNil(this.extraDataFecther) &&
        !R.isEmpty(this.extraDataFecther)
      ) {
        for (const key in this.extraDataFecther) {
          this.extraDataFecther[key](response.data, this.params)
            .then(extraResponse => {
              Vue.set(this.extraData, key, extraResponse.data)
            })
            .catch(error => {
              console.error(`get ${key} data error: ${error}`)
            })
        }
      }
      if (R.is(Function, this.fetchDataCb)) {
        this.fetchDataCb(response)
      }
      this.totals = response.data?.totals || {}
      // if (!showDetails && this.total > 0 && !response.data.marker_field) {
      // setTimeout(() => {
      // this.fetchData(offset, limit, true)
      // }, 1)
      // }
      // if (showDetails) {
      //   this.isPreLoad = false
      // }
      return response.data
    } catch (error) {
      throw error
    } finally {
      this.loaded = true
      this.loading = false
    }
  }

  async pageRender (allData) {
    this.data = allData
    const keys = Object.keys(allData)
    if (this.pagerType === 'loadMore' || keys.every(key => /^\d+$/.test(key))) {
      keys.sort((a, b) => {
        return Number(b) - Number(a)
      })
    }
    const that = this.templateContext
    for (let i = 0; i < keys.length; i += 20) {
      if (i === 0) {
        keys.slice(i, i + 20).forEach(key => {
          if (this.data[key]?.data) {
            that.$set(this.data[key].data, 'isDataShow', true)
          }
        })
      } else {
        setTimeout(() => {
          keys.slice(i, i + 20).forEach(key => {
            if (this.data[key]?.data) {
              that.$set(this.data[key].data, 'isDataShow', true)
            }
          })
        }, i / 20)
      }
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
    return this.fetchData(this.offset, this.getLimit())
  }

  resetRefresh () {
    this.filter = {}
    this.reset(this.pagerType === 'loadMore')
    return this.fetchData(0, this.getLimit())
  }

  /**
   * @description 更新排序
   * @param {String} property 排序的key
   * @param {String} order 排序方式
   */
  doSort (property, order, column = {}) {
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
      const { sortBy } = column
      if (sortBy) {
        params = {
          ...params,
          [sortBy]: order,
        }
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
  genParams (offset, limit, showDetails) {
    let params = {
      scope: this.templateContext.$store.getters.scope,
      show_fail_reason: true,
      ...this.getOptionParams(),
    }
    if (showDetails) {
      params.details = true
    } else {
      params.details = false
    }
    params.summary_stats = true
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
    if ((!R.isEmpty(this.tagFilter) && !R.isNil(this.tagFilter)) || (!R.isEmpty(this.projectTagFilter) && !R.isNil(this.projectTagFilter)) || (!R.isEmpty(this.tagFilter2) && !R.isNil(this.tagFilter2)) || (!R.isEmpty(this.tagFilter3) && !R.isNil(this.tagFilter3))) {
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
      params.limit = this.loadMoreSize
      // delete params.limit
      delete params.offset
    }
    if (R.is(Function, this.genParamsCb)) {
      const p = this.genParamsCb(params)
      if (R.is(Object, p)) params = p
    }
    params = mergeFilter({ ...params }, { ...this.pinFilter })
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
   * @description 根据隐藏列隐藏对应的filter
   * @param {Object} filterOptions
   * @returns {Object}
   */
  genFilterOptions (filterOptions, autoHiddenFilterKey) {
    if (R.isEmpty(filterOptions)) return filterOptions
    let ret = {}
    if (autoHiddenFilterKey) {
      for (const key in filterOptions) {
        if (!this.ctx.$isScopedPolicyMenuHidden(`${autoHiddenFilterKey}.${filterOptions[key].hiddenField || key}`)) {
          ret[key] = filterOptions[key]
        }
      }
    } else {
      ret = { ...filterOptions }
    }
    return ret
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
      data[item[this.idKey]] = new DataWrap(
        this,
        item,
        this.idKey,
        i + dataLength,
      )
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
    item.data = { ...data, isDataShow: true }
  }

  /**
   * @description 批量更新数据的属性
   * @param {Object} data { id1: { prop1: 'xx', prop2: 'xx' } }
   * @memberof CreateList
   */
  updatesProperty (data) {
    const ids = Object.keys(data)
    ids.forEach(id => {
      const item = this.data[id]
      if (item) {
        item.data = { ...item.data, ...data[id] }
      }
    })
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
  checkSteadyStatus (ids = []) {
    if (
      R.isNil(this.steadyStatus) ||
      R.isEmpty(this.steadyStatus) ||
      R.isNil(this.data) || R.isEmpty(this.data)
    ) { return }
    // 现在状态异常的数据 + 即将会更新状态的数据
    const batchCheckStatusList = [...this.getAbnormalStatusList(), ...ids].filter(id => id)
    this.batchCheckStatusList = batchCheckStatusList
    if (batchCheckStatusList.length > 0) {
      this.startBatchCheckStatusTimer()
    }
  }

  /**
   * @description 清除轮询更新
   * @memberof CreateList
   */
  clearWaitJob () {
    if (
      R.isNil(this.steadyStatus) ||
      R.isEmpty(this.steadyStatus) ||
      R.isNil(this.data) || R.isEmpty(this.data)
    ) { return }
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
   * @description 修改加载更多条数
   * @param {Number} size
   */
  changeLoadMoreSize (size) {
    this.loadMoreSize = size
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
    this.reset(this.pagerType === 'loadMore')
    this.fetchData(0, 0)
  }

  /**
   * @description 标签过滤条件变更
   * @param {*} tagFilter
   * @memberof CreateList
   */
  changeTagFilter (tagFilter) {
    this.tagFilter = tagFilter
    this.reset(this.pagerType === 'loadMore')
    this.fetchData(0, 0)
  }

  /**
   * @description 标签过滤条件变更
   * @param {*} tagFilter
   * @memberof CreateList
   */
  changeTagFilter2 (tagFilter) {
    this.tagFilter2 = tagFilter
    this.reset(this.pagerType === 'loadMore')
    this.fetchData(0, 0)
  }

  /**
 * @description 标签过滤条件变更
 * @param {*} tagFilter
 * @memberof CreateList
 */
  changeTagFilter3 (tagFilter) {
    this.tagFilter3 = tagFilter
    this.reset(this.pagerType === 'loadMore')
    this.fetchData(0, 0)
  }

  /**
   * @description 项目标签过滤条件变更
   * @param {[tags, project_tags]: Array, tagFilterKey: String} projectTagFilter
   * @memberof CreateList
   */
  changeProjectTagFilter (projectTagFilter) {
    if (!this.projectTagFilter.tagFilterKey) {
      this.projectTagFilter = projectTagFilter
    } else if (!R.equals(this.projectTagFilter, projectTagFilter)) {
      this.projectTagFilter = projectTagFilter
      this.reset(this.pagerType === 'loadMore')
      this.fetchData(0, 0)
    }
  }

  /**
   *
   */
  savePinFilter () {
    this.pinSavedFilters = {
      filter: R.clone(this.filter),
      tagFilter: R.clone(this.tagFilter),
      tagFilter2: R.clone(this.tagFilter2),
      tagFilter3: R.clone(this.tagFilter3),
      projectTagFilter: R.clone(this.projectTagFilter),
    }
    this.filter = {}
    this.tagFilter = {}
    this.tagFilter2 = {}
    this.tagFilter3 = {}
    this.projectTagFilter = {}
    this.pinFilter = {
      filter: `${this.idKey}.in(${this.selected.map(id => `"${id}"`)})`,
    }
    this.reset(this.pagerType === 'loadMore')
    this.fetchData(0, 0)
  }

  /**
   *
   */
  restorePinFilter () {
    this.filter = this.pinSavedFilters.filter || {}
    this.tagFilter = this.pinSavedFilters.tagFilter || {}
    this.tagFilter2 = this.pinSavedFilters.tagFilter2 || {}
    this.tagFilter3 = this.pinSavedFilters.tagFilter3 || {}
    this.projectTagFilter = this.pinSavedFilters.projectTagFilter || {}
    this.pinFilter = {}
    this.reset(this.pagerType === 'loadMore')
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
      if (key.startsWith('__condition_')) {
        if (this.filter[key] === 'not_equals') {
          const condition_origin_key = key.replace('__condition_', '')
          const option = this.filterOptions[condition_origin_key]
          if (!option.formatter) {
            ret[`${condition_origin_key}_negation`] = true
          }
        }
        continue
      }
      const option = this.filterOptions[key]
      let val = this.filter[key]
      if (option.formatter) {
        if (option.date || option.month) {
          if (val[0] && val[1]) {
            val = option.formatter(val, 'range')
          } else if (val[0]) {
            val = option.formatter(val[0], 'before')
          } else if (val[1]) {
            val = option.formatter(val[1], 'after')
          }
        } else {
          val = option.formatter(val, this.filter[`__condition_${key}`])
        }
      }
      if (option.filterAny) {
        ret.filter_any = 'true'
      }
      if (option.filter) {
        if (option.jointFilter) {
          jointFilters.push(val)
        } else {
          Array.isArray(val) ? filters.push(...val) : filters.push(val)
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
   * @description 远端获取过滤项
   *
   * @param { Object } item
   * @returns values
   * @memberof CreateList
   */
  async fetchDistinctField (item) {
    try {
      let params = {
        scope: this.templateContext.$store.getters.scope,
        [item.distinctField.type]: item.distinctField.key,
        ...(R.is(Function, item.distinctField.getParams)
          ? item.distinctField.getParams()
          : item.distinctField.getParams),
        ...(R.is(Function, item.getParams)
          ? item.getParams()
          : item.getParams),
        ...this.getOptionParams(),
      }
      params = {
        ...params,
        ...this.genFilterParams(params),
      }
      let response = { data: {} }
      if (item.fetchMethod) {
        response = await item.fetchMethod(params)
      } else {
        response = await this.onManager('get', {
          managerArgs: {
            id: item.distinctFieldId || 'distinct-field',
            params: {
              ...params,
            },
          },
        })
      }
      let options = []
      const values = response.data[item.distinctFieldId === 'distinct-fields' ? item.distinctField.type + 's' : item.distinctField.key] || []
      if (
        item.distinctField.afterFetch &&
        R.is(Function, item.distinctField.afterFetch)
      ) {
        options = await item.distinctField.afterFetch(values, {
          scope: this.templateContext.$store.getters.scope,
        })
      } else {
        if (item.distinctFieldId === 'distinct-fields') {
          options = values.map(l => {
            return {
              label: l[item.distinctField.key[0]],
              key: l[item.distinctField.key[0]],
            }
          })
        } else {
          options = values.map(item => ({ label: item, key: item }))
        }
      }

      if (item.mapper) {
        options = item.mapper(options, response.data)
      }

      return options
    } catch (error) {
      return error
    }
  }

  /**
   * @description 更新过滤条件，同时同步至搜索框中
   *
   * @param {*} { key, value, items }
   * @memberof CreateList
   */
  updateFilter ({ key, value, items }) {
    if (items) {
      let newItems = [...(this.filterOptions[key].items || []), ...items]
      newItems = R.uniqBy(item => item.key, newItems)
      this.filterOptions[key].items = newItems
      if (this.filterOptions[key].distinctField) {
        this.fetchDistinctField(this.filterOptions[key]).then(values => {
          this.filterOptions[key].items = values
        })
      }
    }
    const filter = { ...this.filter }
    filter[key] = value
    this.changeFilter(filter)
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
    let index2 = 0
    let index3 = 0
    const { projectTagFilter = {} } = this
    const { tagFilterKey = 'project_tags' } = projectTagFilter
    if (projectTagFilter[tagFilterKey]) {
      if (tagFilterKey === 'tags') {
        projectTagFilter[tagFilterKey].map(item => {
          ret[`${tagFilterKey}.${index}.key`] = item.key
          ret[`${tagFilterKey}.${index}.value`] = item.value
          index++ // 当过滤key为tags，与普通标签参数合并
        })
      } else {
        projectTagFilter[tagFilterKey].map((item, idx) => {
          ret[`${tagFilterKey}.0.${idx}.key`] = item.key
          ret[`${tagFilterKey}.0.${idx}.value`] = item.value
        })
      }
    }
    // if (projectTagFilter[`no_${tagFilterKey}`]) {
    //   projectTagFilter[`no_${tagFilterKey}`].map((item, idx) => {
    //     if (tagFilterKey === 'tags') {
    //       ret[`no_${tagFilterKey}.${idx}.key`] = item.key
    //     } else {
    //       ret[`no_${tagFilterKey}.0.${idx}.key`] = item.key
    //     }
    //   })
    // }
    R.forEachObjIndexed((value, key) => {
      if (FULL_TAG_FILTER_KEYS.includes(key) && value && value[0] === true) {
        ret[key] = true
      } else {
        ret[`tags.${index}.key`] = []
        let len = 1
        if (value && value.length) len = value.length
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            ret[`tags.${index}.key`] = key
            ret[`tags.${index}.value`] = value[i]
            index++
          }
        } else {
          ret[`tags.${index}.value`] = ''
        }
      }
    }, this.tagFilter)

    R.forEachObjIndexed((value, key) => {
      if (FULL_TAG_FILTER_KEYS.includes(key) && value && value[0] === true) {
        ret[key] = true
      } else {
        ret[`project_tags.0.${index2}.key`] = []
        let len = 1
        if (value && value.length) len = value.length
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            ret[`project_tags.0.${index2}.key`] = key
            ret[`project_tags.0.${index2}.value`] = value[i]
            index2++
          }
        } else {
          ret[`project_tags.0.${index2}.value`] = ''
        }
      }
    }, this.tagFilter2)

    R.forEachObjIndexed((value, key) => {
      if (FULL_TAG_FILTER_KEYS.includes(key) && value && value[0] === true) {
        ret[key] = true
      } else {
        ret[`instancetags.${index3}.key`] = []
        let len = 1
        if (value && value.length) len = value.length
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            ret[`instancetags.${index3}.key`] = key
            ret[`instancetags.${index3}.value`] = value[i]
            index3++
          }
        } else {
          ret[`instancetags.${index3}.value`] = ''
        }
      }
    }, this.tagFilter3)

    TAG_FILGER_KEYS.map(key => {
      if (ret[`with_${key}`] && ret[`without_${key}`]) {
        delete ret[`with_${key}`]
        delete ret[`without_${key}`]
      }
    })

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
      const {
        disable_delete: disableDelete,
        can_delete: canDelete,
      } = this.selectedItems[i]
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
      this.checkSteadyStatus(selectedIds)
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
  singleRefresh (id, steadyStatus, singleExtraParams = {}) {
    const params = { ...this.params, ...singleExtraParams }
    delete params.offset
    delete params.limit
    return this.manager
      .get({
        id,
        params,
      })
      .then(response => {
        this.update(id, response.data)
        if (steadyStatus) {
          this.checkSteadyStatus([id])
        }
        return response
      })
  }

  /**
   *
   * 刷新单条数据
   * @param {String} id
   * @param {Array} steadyStatus 所期望的状态，以便定时更新
   * @returns Promise
   */
  singleRefreshWithoutParams (id, steadyStatus) {
    return this.manager
      .get({
        id,
        params: {},
      })
      .then(response => {
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
      this.checkSteadyStatus(selectedIds)
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
    let { steadyStatus, id: ids = this.selected, managerArgs = {} } = opts
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
    const promise = this.manager[on]({ ...managerArgs })
      .then(async res => {
        if (refreshActions.includes(on)) {
          this.refresh()
          return res
        }
        let isBatch = false
        if (R.is(Array, res.data.data) && on !== 'getSpecific') {
          isBatch = true
        }
        // 需要调用get更新数据的id
        const waitUpdateIds = []
        if (on !== 'get') {
          if (isBatch) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              const rec = res.data.data[i]
              if (rec.status < 400) {
                // success
                // this.update(rec[this.idKey], rec.data)
                waitUpdateIds.push(rec[this.idKey])
              } else {
                // failure
                this.setError(rec[this.idKey], res)
              }
            }
          } else {
            if (res.status < 400) {
              if (on !== 'getSpecific') {
                for (let i = 0; i < ids.length; i++) {
                  waitUpdateIds.push(ids[i])
                }
                // this.update(ids[0], res.data)
              }
            } else {
              this.setError(ids[0], res)
            }
          }
        }
        if (waitUpdateIds.length > 0) {
          const params = { ...this.params }
          delete params.limit
          delete params.offset
          const batchResponse = await this.manager.batchGet({
            id: waitUpdateIds,
            params,
          })
          for (let i = 0, len = batchResponse.data.data.length; i < len; i++) {
            const rec = batchResponse.data.data[i]
            this.update(rec[this.idKey], rec)
          }
        }
        if (steadyStatus) {
          this.checkSteadyStatus(ids)
        }
        return res
      })
      .catch(err => {
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
