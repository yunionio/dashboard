<template>
  <div>
    <a-select
      class="base-select"
      :disabled="disabled"
      v-bind="{ ...selectProps, ...filterOpts, ...otherOpts }"
      :style="{ width: (showSync ? 'calc(100% - 24px)' : '100%'), 'min-width': minWidth, ...selectStyle }"
      :value="value"
      :option-label-prop="optionLabelProp"
      @blur="onBlur"
      @change="val => change(val, true)"
      @search="loadOptsDebounce"
      @dropdownVisibleChange="dropdownChange"
      :loading="loadingC">
      <div slot="dropdownRender" slot-scope="menu">
        <v-nodes :vnodes="menu" />
        <div class="d-flex justify-content-center mb-2" v-if="resList.length > 0">
          <a-button class="mx-auto" :loading="loading" :disabled="loading" v-if="showLoadMore" @mousedown="e => e.preventDefault()" type="link" @click="loadMore">{{$t('common.LoadMore')}}</a-button>
          <span v-else-if="loadMoreClicked && noMoreData" class="text-color-secondary pt-2 pb-1">{{$t('common_640')}}</span>
        </div>
      </div>
      <slot v-if="!$scopedSlots.optionLabelTemplate" name="optionTemplate" v-bind:options="resOpts">
        <a-select-option v-for="item of resOpts" :key="item.id" :value="item.id" :label="getLabel(item)" :disabled="item.__disabled">
          <option-label :nameKey="nameKey" :labelFormat="labelFormat" :data="item" :resource="resource" :applyOptionLabel="applyOptionLabel" />
        </a-select-option>
      </slot>
      <template v-else>
        <a-select-option v-for="item of resOpts" :key="item.id" :value="item.id" :label="getLabel(item)" :disabled="item.__disabled" :class="item.optClass">
          <option-label-prefix :nameKey="nameKey" :data="item" />
          <slot name="optionLabelTemplate" v-bind:item="item" />
        </a-select-option>
      </template>
    </a-select>
    <a-icon v-if="showSync" type="sync" class="ml-2 primary-color" :spin="loading" @click="refresh" />
  </div>
</template>
<script>
import * as R from 'ramda'
import _ from 'lodash'
import debounce from 'lodash/debounce'
import { Manager } from '@/utils/manager'
import { arrayToObj } from '@/utils/utils'
import i18n from '@/locales'
import OptionLabel from './OptionLabel'
import OptionLabelPrefix from './OptionLabelPrefix'

const del$t = value => {
  if (!R.is(Object, value)) return {}
  const obj = { ...value }
  delete obj.$t
  return obj
}

export default {
  name: 'BaseSelect',
  components: {
    OptionLabel,
    OptionLabelPrefix,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  inheritAttrs: false,
  props: {
    value: {
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    needParams: { // 是否在需要 params 的情况下才去请求参数
      type: Boolean,
      default: false,
    },
    ctx: {
      type: Array,
      default: () => [],
    },
    needCtx: { // 是否在需要 ctx 的情况下才去请求参数
      type: Boolean,
      default: false,
    },
    resource: {
      type: String,
      default: null,
    },
    version: {
      type: String,
      default: 'v2',
      validator: val => ['v1', 'v2'].includes(val),
    },
    labelFormat: {
      type: Function,
    },
    filterable: { // 是否开启本地搜索
      type: Boolean,
      default: true,
    },
    remote: { // 是否开启远程搜索
      type: Boolean,
      default: false,
    },
    searchKey: { // 远程搜索时 search key
      type: String,
      default: 'name',
    },
    remoteFn: { // 远程搜索回调函数取参数
      type: Function,
    },
    selectProps: { // vue-ant-design a-select 的属性
      type: Object,
      required: false,
      default: () => ({
        placeholder: i18n.t('common.select'),
      }),
    },
    options: {
      type: Array,
    },
    disabledItems: { // options 中的 disabled 项
      type: Array,
    },
    mapper: { // 请求数据后进行数据处理
      type: Function,
      required: false,
    },
    idKey: {
      type: String,
      default: 'id',
    },
    nameKey: {
      type: String,
      default: 'name',
    },
    isDefaultSelect: { // 是否开启默认选择
      type: Boolean,
      default: false,
    },
    initLoaded: Boolean, // 首次加载完成
    showSync: {
      type: Boolean,
      default: false,
    },
    minWidth: {
      type: String,
      default: '200px',
    },
    destroyedCallBack: {
      type: Function,
      required: false,
      default: () => { },
    },
    cancelToken: {
      type: Object,
      required: false,
    },
    applyOptionLabel: {
      type: Boolean,
      default: true,
    },
    optionLabelProp: {
      type: String,
      required: false,
      default: '',
    },
    beforeDefaultSelectCallBack: { // 默认选项之前走的回调函数
      type: Function,
      required: false,
    },
    selectStyle: Object,
    dropdownItemWordWrap: {
      type: Boolean,
      default: false,
    },
    // 远程请求模式的额外数据
    extraOpts: {
      type: Array,
      default: () => ([]),
    },
    autoLoadDefaultSelect: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    this.loadOptsDebounce = debounce(this.loadOpts, 500)
    return {
      resOpts: {},
      resList: [],
      allResList: [],
      query: undefined,
      loading: false,
      showLoadMore: false,
      noMoreData: false,
      loadMoreClicked: false,
      loadMoreOffset: 0,
      sourceList: [], // 未经过 mapper 的数据
      isInitLoad: true,
      currentItem: {},
      firstResOpts: {}, // 第一次调取接口的数据，用于搜索之后再次点开select时重置数据用
      fetchDataNum: 0,
      firstTotal: 0,
      concatFirstOpts: false, // 是否和初始化数据合并的标志位
    }
  },
  computed: {
    filterOpts () {
      if (this.remote && _.get(this.selectProps, 'mode') !== 'mutiple') {
        return {
          filterOption: false,
          showSearch: true,
        }
      }
      if (this.filterable) {
        return {
          optionFilterProp: 'children',
          showSearch: true,
          filterOption: this.filterOption,
        }
      }
      return {
        filterOption: false,
      }
    },
    otherOpts () {
      const ret = {}
      if (this.dropdownItemWordWrap) {
        ret.dropdownClassName = 'dropdown-item-word-wrap'
        const { dropdownClassName = '' } = this.selectProps
        if (dropdownClassName) {
          ret.dropdownClassName = ret.dropdownClassName + ' ' + dropdownClassName
        }
      }
      return ret
    },
    loadingC () {
      if (this.selectProps && R.is(Boolean, this.selectProps.loading)) return this.selectProps.loading
      return this.loading
    },
    labelInValueKeyName () {
      const { labelInValueKeyName = 'value' } = this.selectProps
      return labelInValueKeyName
    },
  },
  watch: {
    params (val, oldV) {
      this.paramsChange(val, oldV)
    },
    ctx (val, oldV) {
      this.paramsChange(val, oldV)
    },
    resource (val, oldV) {
      this.resOpts = {}
      this.resList = []
      this.sourceList = []
      if (val) this.paramsChange(val, oldV, true) // 加上判断，防止出现 /undefined？xxx=xxx 的请求
    },
    options: {
      handler (val) {
        if (val && val.length) {
          const resOpts = val.map(item => {
            const key = item[this.idKey] || item.key || item.value
            return {
              ...item,
              key,
              id: key,
              name: item.name || item.label,
            }
          })
          this.resOpts = arrayToObj(resOpts)
          this.disabledOpts()
          if (this.value) this.syncItem(this.value)
        } else {
          this.resOpts = {}
        }
      },
      immediate: true,
    },
    disabledItems: {
      handler (val) {
        this.disabledOpts()
      },
      immediate: true,
    },
    value (v) {
      this.syncItem(v)
    },
    extraOpts (list) {
      this.resList = [..._.cloneDeep(list), ...this.sourceList]
      this.$emit('update:resList', this.resList)
      const resOpts = arrayToObj(this.resList)
      this.resOpts = resOpts
      this.disabledOpts()
    },
    resList (list) {
      this.allResList = this.mergeListByIdKey(this.allResList, list)
    },
  },
  mounted () {
    if (this._valid()) this.loadOpts()
  },
  destroyed () {
    this.destroyedCallBack()
  },
  methods: {
    dropdownChange (open) {
      this.$emit('dropdownChange', open)
      if (!this.remote) return
      if (open) { // 打开
        if (!R.isEmpty(this.firstResOpts) && !this.concatFirstOpts && !R.isEmpty(this.currentItem)) {
          this.resOpts = { ...this.firstResOpts, [this.currentItem[this.idKey]]: this.currentItem }
          const list = Object.values(this.resOpts)
          this.resList = list
          if (!this.sourceList.find(val => val[this.idKey] === this.currentItem[this.idKey])) {
            this.sourceList.push(this.currentItem)
          }
          this.concatFirstOpts = true // 做标识，标识已和初始化数据做过合并
          if (this.firstTotal > this.sourceList.length) {
            // if (!this.mapper && this.firstTotal > list.length) { 暂时先不用mapper这种hack的修复方式
            this.showLoadMore = true
          }
        }
      } else { // 关闭
        this.$nextTick(() => {
          this.loadMoreClicked = false
          this.noMoreData = false
        })
      }
    },
    filterOption (input, option) {
      let text = _.get(option, 'componentOptions.children[0].componentInstance.text')
      if (!text) {
        const propsData = _.get(option, 'componentOptions.children[0].componentOptions.propsData')
        const nameKey = propsData.nameKey
        if (nameKey) {
          text = propsData.data[nameKey]
        }
      }
      if (text) {
        return text.toLowerCase().includes(input.toLowerCase())
      }
    },
    paramsChange (val, oldV, needChange = false) {
      val = del$t(val)
      oldV = del$t(oldV)
      if (needChange || !R.equals(val, oldV)) {
        if (needChange || !this.isInitLoad) this.clearSelect()
        if (needChange || this._valid()) {
          this.fetchDataNum = 0 // paramsChange 后 fetchDataNum 应该重置，这样 firstResOpts 保证能正确更新到
          this.firstResOpts = {}
          this.firstTotal = 0
          this.currentItem = {}
          this.loadOpts()
        }
      }
    },
    _valid () {
      const params = del$t(_.cloneDeep(this.params))
      if (
        (this.resource && (!this.options || !this.options.length)) &&
        ((!this.needParams && !this.needCtx) ||
          (this.needParams && !R.isEmpty(params)) ||
          (this.needCtx && !R.isEmpty(this.ctx)) ||
          (this.needCtx && this.needParams && !R.isEmpty(this.ctx) && !R.isEmpty(params)))
      ) {
        return true
      }
      return false
    },
    clearSelect () {
      let initValue
      this.change(initValue)
    },
    onBlur () {
      this.loadMoreOffset = 0
      this.query = undefined
    },
    change (val, isNative) {
      const changeValue = val
      if (R.is(Object, changeValue) && R.is(Array, changeValue.label)) { // 兼容 label-in-value 的形式
        const data = _.get(changeValue, 'label[0].componentOptions.propsData.data')
        const nameKey = _.get(changeValue, 'label[0].componentOptions.propsData.nameKey')
        if (data && nameKey) {
          changeValue.label = data[nameKey]
        }
      }
      // 同步当前选择项obj
      this.syncItem(changeValue)
      this.$emit('input', changeValue)
      this.$emit('change', changeValue, isNative)
    },
    syncItem (value) {
      if (value) {
        // 多选模式
        if (_.get(this.selectProps, 'mode') === 'multiple') {
          const items = []
          value.map(item => {
            const syncValue = R.is(Object, item) ? this.resOpts[item.key] : this.resOpts[item]
            if (R.is(Object, syncValue)) {
              items.push(syncValue)
            }
          })
          this.$emit('update:items', items)
        }
        // 单选模式
        const syncValue = R.is(Object, value) ? this.resOpts[value.key] : this.resOpts[value]
        if (R.is(Object, syncValue)) {
          this.currentItem = syncValue
          this.$emit('update:item', syncValue)
        }
      }
    },
    disabledOpts () {
      if (!R.is(Array, this.disabledItems)) return
      this.$nextTick(() => {
        R.forEachObjIndexed((value, key) => {
          this.$set(this.resOpts[key], '__disabled', false)
        }, this.resOpts)
        const disabledItems = this.disabledItems || []
        disabledItems.forEach(disabledId => {
          if (R.is(Object, this.resOpts[disabledId])) {
            this.$set(this.resOpts[disabledId], '__disabled', true)
          }
        })
      })
    },
    genParams (query, offset) {
      const manager = new Manager(this.resource, this.version)
      let params = { ...this.params }
      if (query && this.remote) {
        if (this.remoteFn) {
          params = { ...params, ...this.remoteFn(query) }
        } else {
          // 进行查询信息检测，如果符合ip地址规则进行ip地址匹配
          if (/^[0-9]{1,3}\./.test(query) && !/[a-zA-Z]+/.test(query)) {
            const ipSearchKey = 'ip_addr'
            params[ipSearchKey] = query
          } else {
            if (params.filter) {
              if (R.is(Array, params.filter)) {
                params.filter = [...params.filter, `${this.searchKey}.contains(${query})`]
              } else {
                params.filter = [params.filter, `${this.searchKey}.contains(${query})`]
              }
            } else {
              params.filter = `${this.searchKey}.contains(${query})`
            }
          }
        }
      }
      if (R.is(Number, offset)) params.offset = offset
      return { manager, params }
    },
    genDefaultParams (fetchKeys) {
      const { manager, params } = this.genParams(this.query)
      const idFilter = `${this.idKey}.in(${fetchKeys.join(',')})`
      if (params.filter) {
        params.filter = R.is(String, params.filter) ? [params.filter, idFilter] : [...params.filter, idFilter]
      } else {
        params.filter = `${this.idKey}.in(${fetchKeys.join(',')})`
      }
      params.$t = 1
      return { manager, params }
    },
    async loadMore () {
      this.loadMoreClicked = true
      this.loadMoreOffset += (this.params.limit || 20)
      const { manager, params } = this.genParams(this.query, this.loadMoreOffset)
      const { list, data, sourceList } = await this.fetchData(manager, params)
      if ((data.data && data.data.length > 0) && (data.total > (sourceList.length + this.sourceList.length))) { // 前提是点击加载更多后data得有数据，才能展示加载更多
        this.noMoreData = false
        this.showLoadMore = true
      } else {
        this.showLoadMore = false
        this.noMoreData = true // 没有更多了
      }
      this.sourceList = this.mergeListByIdKey(this.sourceList, sourceList)
      this.resList = this.mergeListByIdKey(this.resList, list)
      this.$emit('update:resList', this.resList)
      const resOpts = arrayToObj(this.resList)
      this.resOpts = resOpts
      this.disabledOpts()
    },
    getSelectedList (query) {
      const selected = R.is(Object, this.value) ? this.value[this.labelInValueKeyName] : this.value
      if (!selected) return []
      return this.allResList.filter(item => {
        if ((!query || (item[this.searchKey] && item[this.searchKey].includes(query))) && item[this.idKey] === selected) {
          return true
        }
        return false
      })
    },
    async loadOpts (query) {
      if (this.options) return // 指定数据源是外传options,这里不请求
      if (!query || (!R.isNil(query) && this.remote)) { // 没有query或者是有query但是需要有remote才执行
        const { manager, params } = this.genParams(query)
        this.loadMoreOffset = 0
        this.query = query
        try {
          const { list, data, sourceList } = await this.fetchData(manager, params)
          if (data && data.data && data.total > data.data.length) {
            this.noMoreData = false
            this.showLoadMore = true
          } else {
            this.showLoadMore = false
            this.noMoreData = true // 没有更多了
          }
          const expectedSelectedList = this.getSelectedList(query)
          this.sourceList = this.mergeListByIdKey(sourceList, expectedSelectedList)
          // 额外待选项也参与过滤
          const targetExtraOpts = this.extraOpts.filter(item => {
            if (!query) return true
            if (item[this.searchKey] && item[this.searchKey].includes(query)) {
              return true
            }
          })
          this.resList = this.mergeListByIdKey([...targetExtraOpts, ...list], expectedSelectedList)
          this.$emit('update:resList', this.resList)
          const resOpts = arrayToObj(this.resList)
          this.resOpts = resOpts
          this.concatFirstOpts = false
          this.disabledOpts()
          this.$emit('update:initLoaded', true)
          this.fetchDataNum++
          if (this.fetchDataNum === 1) {
            this.firstResOpts = resOpts
            this.firstTotal = data.total
            // 加载默认选中项
            if (this.autoLoadDefaultSelect) {
              await this.loadDefaultSelectedOpts()
            }
          }
          this.defaultSelect([...this.extraOpts, ...this.resList])
          return list
        } catch (error) {
          this.$emit('update:initError')
          throw error
        }
      }
    },
    async fetchData (manager, params) {
      try {
        this.loading = true
        const { data } = await manager.list({ params, ctx: this.ctx, cancelToken: this.cancelToken })
        const _list = R.type(data) === 'Array' ? data : (R.type(data) === 'Object' && (data.data || []))
        let list = _list.map(val => ({ ...val, id: val[this.idKey], name: val[this.nameKey] }))
        const sourceList = list
        if (this.mapper) {
          list = this.mapper(R.clone(list))
        }
        this.loading = false
        this.isInitLoad = false
        return { list, data, sourceList }
      } catch (error) {
        this.loading = false
        this.isInitLoad = false
        throw error
      }
    },
    mergeListByIdKey (sourceList, mergeList) {
      const ret = []
      sourceList.map(s => {
        if (!ret.some(item => item[this.idKey] === s[this.idKey])) {
          ret.push(s)
        }
      })
      mergeList.map(s => {
        if (!ret.some(item => item[this.idKey] === s[this.idKey])) {
          ret.push(s)
        }
      })
      return ret
    },
    async loadDefaultSelectedOpts () {
      // eslint-disable-next-line
      return new Promise(async (resolve) => {
        let selected = []
        if (R.is(Array, this.value)) {
          selected = this.value.filter(key => !!key)
        } else if (R.is(Object, this.value) || R.is(String, this.value)) {
          const v = R.is(Object, this.value) ? this.value[this.labelInValueKeyName] : this.value
          if (v) selected.push(v)
        }
        const noHas = []
        selected.map(key => {
          if (!this.resOpts[key]) {
            noHas.push(key)
          }
        })
        if (!selected.length || !noHas.length) {
          resolve()
          return
        }
        // 拉取默认选中或后续主动修改但第一次未拉取到的选项
        const { manager, params } = this.genDefaultParams(noHas)
        const { list, sourceList } = await this.fetchData(manager, params)
        if (list.length) {
          this.sourceList = this.mergeListByIdKey(this.sourceList, sourceList)
          this.resList = this.mergeListByIdKey(this.resList, list)
          this.$emit('update:resList', this.resList)
          const resOpts = arrayToObj(this.resList)
          this.resOpts = resOpts
          this.firstResOpts = { ...this.firstResOpts, ...resOpts }
          this.disabledOpts()
        } else {
          // 所选项没有，清空或保留
          if (this.isDefaultSelect) {
            if (this.resList.length > 0) {
              const defaultItem = this.resList[0]
              if (this.selectProps && this.selectProps.labelInValue) {
                this.change({ label: defaultItem[this.nameKey], [this.labelInValueKeyName]: defaultItem[this.idKey] })
              } else {
                this.change(defaultItem[this.idKey])
              }
            } else {
              this.clearSelect()
            }
          }
        }
        resolve()
      })
    },
    defaultSelect (list) {
      if (this.beforeDefaultSelectCallBack) {
        if (!this.beforeDefaultSelectCallBack(list)) return
      }
      let isErrorOrEmpty = !this.value
      let value = this.value
      if (R.is(String, this.value)) {
        value = _.get(this.value, this.labelInValueKeyName) || this.value
        isErrorOrEmpty = !list.find(val => val.id === value || val.key === value)
      }
      if (value && !isErrorOrEmpty) {
        this.syncItem(value)
      } else if (this.isDefaultSelect && list.length > 0 && isErrorOrEmpty) { // 是错误值或者没有初始化值才可以默认选择
        const defaultItem = list[0]
        if (this.selectProps && this.selectProps.labelInValue) {
          this.change({ label: defaultItem[this.nameKey], [this.labelInValueKeyName]: defaultItem[this.idKey] })
        } else {
          this.change(defaultItem[this.idKey])
        }
      } else if (list.length === 0) {
        this.clearSelect()
      }
    },
    getLabel (item) {
      if (this.labelFormat) {
        return this.labelFormat(item)
      }
      return item[this.nameKey]
    },
    refresh () {
      this.fetchDataNum = 0
      this.loadOpts()
    },
  },
}
</script>

<style lang="less">
.dropdown-item-word-wrap {
  .ant-select-dropdown-menu-item {
    white-space: inherit;
  }
}
</style>
