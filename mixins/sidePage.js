import * as R from 'ramda'
import _ from 'lodash'
import i18n from '@/locales'

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
    }, this.data.detail.refreshInterval * 1000)
  }

  /**
   * @description 获取新数据，进行状态检测
   * @memberof WaitStatusJob
   */
  async checkStatus () {
    if (!this.data.detail.manager) return
    const params = this.data.detail.detailParams
    try {
      const { data = {} } = await this.data.detail.manager.get({
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
        this.clearTimer()
      } else {
        this.data.setError(error)
        this.clearTimer()
      }
    }
  }
}

class DataWrap {
  constructor (detail, data, idKey) {
    this.detail = detail
    this.id = data[idKey]
    this.data = data
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

export default {
  props: ['params'],
  data () {
    return {
      data: {},
      loading: false,
      loaded: false,
      // 声明为可监听的对象，方便inject到的error属性是响应式的
      requestError: {
        error: null,
      },
    }
  },
  provide () {
    return {
      requestError: this.requestError,
    }
  },
  computed: {
    sidePageData () {
      return this.$store.getters.sidePages[this.windowId]
    },
    detailData () {
      return this.data.data || {}
    },
    // 是否为list调用
    isList () {
      return !R.isEmpty(this.params.list) && !R.isNil(this.params.list)
    },
    listRowData () {
      if (!this.isList) return {}
      return (this.params.list.data[this.id] && this.params.list.data[this.id].data) || {}
    },
  },
  destroyed () {
    this.clearWaitJob()
    this.manager = null
  },
  created () {
    const {
      id,
      resource,
      apiVersion = 'v2',
      getParams,
      idKey = 'id',
      // 期望的状态，如果不符合预期，则进行定时更新
      steadyStatus = null,
      // 定时更新间隔时间，默认10s
      refreshInterval = 10,
    } = this.params.options
    this.id = id
    // vm 实例
    this.templateContext = this.params.templateContext
    this.resource = resource
    this.getDetailParams = getParams
    if (R.is(String, resource)) {
      this.manager = new this.$Manager(resource, apiVersion)
    }
    this.apiVersion = apiVersion
    this.idKey = idKey
    this.steadyStatus = this.genSteadyStatus(steadyStatus)
    this.refreshInterval = refreshInterval
    this.fetchData()
    if (this.isList) {
      this.$watch('listRowData', (val, oldVal) => {
        if (!R.equals(val, oldVal)) {
          // tips：暂时禁用合并方案
          // 场景：如果更新后新的数据对象中某个key已删除，那么使用合并方案的话又会把该key合并进去
          // this.data.data = { ...(this.data.data || {}), ...val }
          this.data.data = { ...val }
        }
      })
    }
  },
  methods: {
    cancelSidePage () {
      if (this.params && R.is(Function, this.params.cancel)) {
        this.params.cancel()
      }
      this.handleTabChange(this.params.windowData._currentTab)
      this.destroySidePage(this.windowId)
    },
    handleTabChange (val) {
      this._updateWindow({
        id: this.sidePageData.parentWindowId,
        currentTab: val,
      })
    },
    compareStatusWithList (data) {
      const detailStatus = {}
      const listStatus = {}
      Object.keys(this.steadyStatus).forEach(key => {
        detailStatus[key] = data[key]
        listStatus[key] = this.listRowData[key]
      })
      if (detailStatus && listStatus && !R.equals(detailStatus, listStatus)) {
        this.singleRefresh(data[this.idKey], this.steadyStatus)
      }
    },
    async fetchData () {
      this.loading = true
      this.detailParams = this.genParams()
      try {
        let response
        if (R.is(String, this.resource)) {
          response = await this.manager.get({
            id: this.id,
            params: this.detailParams,
          })
        } else {
          response = await this.resource(this.detailParams)
        }
        if (this.templateContext._isDestroyed) return
        const {
          data = {},
        } = response
        this.clearWaitJob()
        this.data = this.wrapData(data)
        this.checkSteadyStatus()
        if (R.is(Function, this.fetchDataCallback)) {
          await this.fetchDataCallback()
        }
        if (this.isList && this.steadyStatus) {
          this.compareStatusWithList(data)
        }
        return response
      } catch (error) {
        this.requestError.error = error
        throw error
      } finally {
        this.loaded = true
        this.loading = false
      }
    },
    /**
     * @description 刷新数据
     */
    refresh () {
      if (this.isList) return this.params.list.refresh(...arguments)
      return this.fetchData()
    },
    /**
     * @param {String} id
     * @param {Array} steadyStatus 所期望的状态，以便定时更新
     * 刷新单条数据
     * @returns Promise
     */
    singleRefresh () {
      if (this.isList) return this.params.list.singleRefresh(...arguments)
      return this.fetchData()
    },
    /**
     * @description 获取api资源相关的参数
     */
    getOptionParams () {
      if (R.is(Function, this.getDetailParams)) {
        return this.getDetailParams() || {}
      }
      return this.getDetailParams || {}
    },
    /**
     * @description 生成所有的请求参数
     * @returns {Object}
     */
    genParams () {
      const params = {
        scope: this.$store.getters.scope,
        show_fail_reason: true,
        show_emulated: true,
        ...this.getOptionParams(),
      }
      return params
    },
    /**
     * @description 生成期望的状态数据结构
     * @param {Array | String | Object} steadyStatus
     * @returns {Object}
     */
    genSteadyStatus (steadyStatus) {
      if (R.is(Array, steadyStatus) || R.is(String, steadyStatus)) {
        return {
          status: steadyStatus,
        }
      }
      return steadyStatus
    },
    /**
     * @description 包装返回数据
     * @param {Array} arr
     * @returns {Object}
     */
    wrapData (obj) {
      const data = new DataWrap(this, obj, this.idKey)
      return data
    },
    /**
     * @description 检查期望状态，是否需要轮询更新
     */
    checkSteadyStatus () {
      if (this.isList) return
      if (
        (R.isNil(this.steadyStatus) || R.isEmpty(this.steadyStatus)) ||
        (R.isNil(this.data) || R.isEmpty(this.data))
      ) return
      const isSteadyStatus = this.data.isSteadyStatus(this.steadyStatus)
      if (!isSteadyStatus) {
        this.data.waitStatus(this.steadyStatus)
      }
    },
    /**
     * @description 清除轮询更新
     */
    clearWaitJob () {
      if (
        (R.isNil(this.steadyStatus) || R.isEmpty(this.steadyStatus)) ||
        (R.isNil(this.data) || R.isEmpty(this.data))
      ) return
      this.data.clearWaitJob()
    },
    /**
     * @description 调用manager方法的桥接方法，调用此方法可以同时更新 list 的对应数据
     * @param {String} on manager 的实例方法
     * @param {Object} opts
     * opts.expectStatus (String || Array || Object) 期望状态
     * opts.id (String || Array)
     * opts.managerArs (Array) 按照指定的 manager 实例方法所需参数顺序传入
     */
    onManager (on, opts) {
      if (this.isList) return this.params.list.onManager(...arguments)
      if (!this.manager) return Promise.resolve()
      let {
        steadyStatus,
        id: ids,
        managerArgs = {},
      } = opts
      const refreshActions = ['create', 'delete', 'batchDelete']
      if (R.is(String, ids)) {
        if (!managerArgs.id) managerArgs.id = ids
        ids = [ids]
      }
      if (R.is(Array, ids)) {
        if (!managerArgs.ids) managerArgs.ids = ids
      }
      if (!managerArgs) {
        throw Error(i18n.t('common_74'))
      }
      if (!R.is(Object, managerArgs)) {
        throw Error(i18n.t('common_75'))
      }
      const promise = this.manager[on]({ ...managerArgs }).then(async res => {
        if (refreshActions.includes(on)) {
          this.refresh()
          return res
        }
        let isBatch = false
        if (R.is(Array, res.data.data)) {
          isBatch = true
        }
        // 需要调用get更新数据的id
        let waitUpdateId = ''
        if (on !== 'get') {
          if (isBatch) {
            const rec = res.data.data[0]
            if (rec.status < 400) {
              // success
              // this.data.data = rec.data
              waitUpdateId = rec[this.idKey]
            } else {
              // failure
              this.data.setError(res)
            }
          } else {
            if (res.status < 400) {
              // this.data.data = res.data
              waitUpdateId = res.data[this.idKey]
            } else {
              this.setError(res)
            }
          }
        }
        if (waitUpdateId) {
          const newDataResponse = await this.manager.get({
            id: waitUpdateId,
            params: this.detailParams,
          })
          this.data.data = newDataResponse.data
        }
        if (steadyStatus) {
          this.data.waitStatus(steadyStatus)
        }
        return res
      }).catch(err => {
        return Promise.reject(err)
      })
      return promise
    },
  },
}
