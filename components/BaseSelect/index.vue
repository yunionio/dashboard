<template>
  <div>
    <a-select
      class="base-select"
      v-bind="{ ...selectProps, ...filterOpts }"
      :style="{ width: (showSync ? 'calc(100% - 22px)' : '100%'), 'min-width': minWidth }"
      :value="value"
      @change="change"
      @search="loadOptsDebounce"
      :loading="loading">
      <slot name="optionTemplate" v-bind:options="resOpts">
        <a-select-option v-for="item of resOpts" :key="item.id" :value="item.id" :disabled="item.__disabled">
          <option-label :nameKey="nameKey" :labelFormat="labelFormat" :data="item" :resource="resource" />
        </a-select-option>
      </slot>
    </a-select>
    <a-icon v-if="showSync" type="sync" class="ml-2" :spin="loading" @click="e => loadOptsDebounce()" :style="{ color: '#1890ff' }" />
  </div>
</template>
<script>
import * as R from 'ramda'
import _ from 'lodash'
import debounce from 'lodash/debounce'
import OptionLabel from './OptionLabel'
import { Manager } from '@/utils/manager'
import { arrayToObj } from '@/utils/utils'

export default {
  name: 'BaseSelect',
  components: {
    OptionLabel,
  },
  inheritAttrs: false,
  props: {
    value: {
      required: true,
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
      loading: false,
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
      if (this.remote && this.selectProps.mode !== 'mutiple') {
        return {
          filterOption: false,
          showSearch: true,
        }
      }
      return {
        filterOption: false,
      }
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
      this.paramsChange(val, oldV)
    },
    options: {
      handler (val) {
        if (val && val.length) {
          const resOpts = val.map(item => {
            return {
              ...item,
              id: item[this.idKey] || item.key || item.value,
              name: item.name || item.label,
            }
          })
          this.resOpts = arrayToObj(resOpts)
        }
      },
      immediate: true,
    },
    disabledItems (val) {
      if (val && val.length) {
        this.disabledOpts()
      }
    },
  },
  mounted () {
    if (this._valid()) this.loadOptsDebounce()
  },
  methods: {
    filterOption (input, option) {
      return option.componentOptions.children[0].componentInstance.text.toLowerCase().includes(input.toLowerCase())
    },
    paramsChange (val, oldV) {
      if (!R.equals(val, oldV)) {
        const isInitLoad = R.is(Object, oldV) && (R.isEmpty(oldV) || R.isNil(oldV)) // 如果oldV是{}，认为是第一次参数变化，则无需 clearSelect
        if (!isInitLoad) this.clearSelect()
        if (this._valid()) this.loadOptsDebounce()
      }
    },
    _valid () {
      if (
        (this.resource && (!this.options || !this.options.length)) &&
        ((!this.needParams && !this.needCtx) ||
        (this.needParams && !R.isEmpty(this.params)) ||
        (this.needCtx && !R.isEmpty(this.ctx)) ||
        (this.needCtx && this.needParams && !R.isEmpty(this.ctx) && !R.isEmpty(this.params)))
      ) {
        return true
      }
      return false
    },
    clearSelect () {
      let initValue
      this.change(initValue)
    },
    change (val) {
      let changeValue = val
      if (R.is(Object, changeValue) && R.is(Array, changeValue.label)) { // 兼容 label-in-value 的形式
        const data = _.get(changeValue, 'label[0].componentOptions.propsData.data')
        const nameKey = _.get(changeValue, 'label[0].componentOptions.propsData.nameKey')
        if (data && nameKey) {
          changeValue.label = data[nameKey]
        }
      }
      this.$emit('input', changeValue)
      this.$emit('change', changeValue)
      // 同步当前选择项obj
      if (changeValue) {
        let syncValue = R.is(Object, changeValue) ? this.resOpts[changeValue.key] : this.resOpts[changeValue]
        if (this.options && this.options.length) syncValue = changeValue // 外面传递 options
        this.$emit('update:item', syncValue)
      }
    },
    disabledOpts () {
      if (this.disabledItems && this.disabledItems.length) { // 禁用某些选项
        R.forEachObjIndexed((value, key) => {
          this.$set(this.resOpts[key], '__disabled', false)
        }, this.resOpts)
        this.disabledItems.forEach(disabledId => {
          if (R.is(Object, this.resOpts[disabledId])) {
            this.$set(this.resOpts[disabledId], '__disabled', true)
          }
        })
      }
    },
    async loadOpts (query) {
      if (!R.isNil(query) && this.filterable) return // 如果开启本地搜索，远程搜索将取消
      this.loading = true
      let manager = new Manager(this.resource, this.version)
      let params = { ...this.params }
      if (query && this.remote) {
        if (this.remoteFn) {
          params = { ...params, ...this.remoteFn(query) }
        } else {
          params.filter = `${this.searchKey}.contains(${query})`
        }
      }
      try {
        const { data: { data = [] } } = await manager.list({ params, ctx: this.ctx })
        let list = data.map(val => ({ ...val, id: val[this.idKey], name: val[this.nameKey] }))
        if (this.mapper) {
          list = this.mapper(list)
        }
        this.$emit('update:resList', list)
        const resOpts = arrayToObj(list)
        this.resOpts = resOpts
        this.disabledOpts()
        this.loading = false
        this.defaultSelect(list)
        this.$emit('update:initLoaded', true)
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    defaultSelect (list) {
      if (this.isDefaultSelect && list.length > 0 && !this.value) { // 没有初始化值才可以默认选择
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
