<template>
  <div>
    <a-select
      class="base-select"
      :disabled="disabled"
      v-bind="{ ...selectProps, ...filterOpts }"
      :style="{ width: (showSync ? 'calc(100% - 22px)' : '100%'), 'min-width': minWidth }"
      :value="value"
      @blur="onBlur"
      @change="change"
      @search="loadOptsDebounce"
      :loading="loadingC">
      <div slot="dropdownRender" slot-scope="menu">
        <v-nodes :vnodes="menu" />
        <div class="d-flex justify-content-center mb-2" v-if="resList.length > 0">
          <a-button class="mx-auto" :loading="loading" :disabled="loading" v-if="showLoadMore" @mousedown="e => e.preventDefault()" type="link" @click="loadMore">{{$t('common.LoadMore')}}</a-button>
          <span v-if="loadMoreClicked && noMoreData" class="text-color-secondary pt-2 pb-1">{{$t('common_640')}}</span>
        </div>
      </div>
      <slot name="optionTemplate" v-bind:options="resOpts">
        <a-select-option v-for="item of resOpts" :key="item.id" :value="item.id" :disabled="item.__disabled">
          <option-label :nameKey="nameKey" :labelFormat="labelFormat" :data="item" :resource="resource" />
        </a-select-option>
      </slot>
    </a-select>
    <a-icon v-if="showSync" type="sync" class="ml-2 primary-color" :spin="loading" @click="e => loadOptsDebounce()" />
  </div>
</template>
<script>
import * as R from 'ramda'
import _ from 'lodash'
import debounce from 'lodash/debounce'
import OptionLabel from './OptionLabel'
import { Manager } from '@/utils/manager'
import { arrayToObj } from '@/utils/utils'
import i18n from '@/locales'

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
  },
  data () {
    this.loadOptsDebounce = debounce(this.loadOpts, 500)
    return {
      resOpts: {},
      resList: [],
      query: undefined,
      loading: false,
      showLoadMore: false,
      noMoreData: false,
      loadMoreClicked: false,
      loadMoreOffset: 0,
      sourceList: [], // 未经过 mapper 的数据
    }
  },
  computed: {
    filterOpts () {
      if (this.filterable) {
        return {
          optionFilterProp: 'children',
          showSearch: true,
          filterOption: this.filterOption,
        }
      }
      if (this.remote && _.get(this.selectProps, 'mode') !== 'mutiple') {
        return {
          filterOption: false,
          showSearch: true,
        }
      }
      return {
        filterOption: false,
      }
    },
    loadingC () {
      if (this.selectProps && R.is(Boolean, this.selectProps.loading)) return this.selectProps.loading
      return this.loading
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
      this.paramsChange(val, oldV, true)
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
  },
  mounted () {
    if (this._valid()) this.loadOptsDebounce()
  },
  methods: {
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
        const isInitLoad = R.is(Object, oldV) && (R.isEmpty(oldV) || R.isNil(oldV)) // 如果oldV是{}，认为是第一次参数变化，则无需 clearSelect
        if (needChange || !isInitLoad) this.clearSelect()
        if (needChange || this._valid()) this.loadOptsDebounce()
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
      this.query = undefined
      this.loadMoreOffset = 0
    },
    change (val) {
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
      this.$emit('change', changeValue)
    },
    syncItem (value) {
      if (value) {
        const syncValue = R.is(Object, value) ? this.resOpts[value.key] : this.resOpts[value]
        if (R.is(Object, syncValue)) {
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
      if (R.is(Number, offset)) params.offset = offset
      return { manager, params }
    },
    async loadMore () {
      this.loadMoreClicked = true
      this.loadMoreOffset += (this.params.limit || 20)
      const { manager, params } = this.genParams(this.query, this.loadMoreOffset)
      const { list, data, sourceList } = await this.fetchData(manager, params)
      if (data.total > (data.data.length + this.sourceList.length)) {
        this.noMoreData = false
        this.showLoadMore = true
      } else {
        this.showLoadMore = false
        this.noMoreData = true // 没有更多了
      }
      this.sourceList = this.sourceList.concat(sourceList)
      this.resList = this.resList.concat(list)
      this.$emit('update:resList', this.resList)
      const resOpts = arrayToObj(this.resList)
      this.resOpts = resOpts
      this.disabledOpts()
    },
    async loadOpts (query) {
      if (!R.isNil(query) && this.filterable) return // 如果开启本地搜索，远程搜索将取消
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
        this.sourceList = sourceList
        this.resList = list
        this.$emit('update:resList', list)
        const resOpts = arrayToObj(list)
        this.resOpts = resOpts
        this.disabledOpts()
        this.defaultSelect(list)
        this.$emit('update:initLoaded', true)
        return list
      } catch (error) {
        throw error
      }
    },
    async fetchData (manager, params) {
      try {
        this.loading = true
        const { data } = await manager.list({ params, ctx: this.ctx })
        const _list = R.type(data) === 'Array' ? data : (R.type(data) === 'Object' && (data.data || []))
        let list = _list.map(val => ({ ...val, id: val[this.idKey], name: val[this.nameKey] }))
        const sourceList = list
        if (this.mapper) {
          list = this.mapper(list)
        }
        this.loading = false
        return { list, data, sourceList }
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    defaultSelect (list) {
      let isErrorOrEmpty = !this.value
      let value = this.value
      if (R.is(String, this.value)) {
        value = _.get(this.value, 'key') || this.value
        isErrorOrEmpty = !list.find(val => val.id === value || val.key === value)
      }
      if (value && !isErrorOrEmpty) {
        this.syncItem(value)
      } else if (this.isDefaultSelect && list.length > 0 && isErrorOrEmpty) { // 是错误值或者没有初始化值才可以默认选择
        const defaultItem = list[0]
        if (this.selectProps && this.selectProps.labelInValue) {
          this.change({ label: defaultItem[this.nameKey], value: defaultItem[this.idKey] })
        } else {
          this.change(defaultItem[this.idKey])
        }
      }
    },
    getLabel (item) {
      if (this.labelFormat) {
        return this.labelFormat(item)
      }
      return item[this.nameKey]
    },
  },
}
</script>
