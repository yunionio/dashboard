<template>
  <a-select
    class="base-select"
    v-bind="{ ...selectProps, ...filterOpts}"
    :value="value"
    @change="change"
    @search="loadOpts"
    :loading="loading">
    <template>
      <a-select-option v-for="item of resOpts" :key="item.id" :value="item.id" :disabled="item.__disabled">{{ item.name }}</a-select-option>
    </template>
  </a-select>
</template>
<script>
import * as R from 'ramda'
import { Manager } from '@/utils/manager'
import { arrayToObj } from '@/utils/utils'

export default {
  name: 'BaseSelect',
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
  },
  data: function () {
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
      return {}
    },
  },
  watch: {
    params (val, oldV) {
      this.paramsChange(val, oldV)
    },
    ctx (val, oldV) {
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
    if (this._valid()) this.loadOpts()
  },
  methods: {
    filterOption (input, option) {
      return option.componentOptions.children[0].text.toLowerCase().includes(input.toLowerCase())
    },
    paramsChange (val, oldV) {
      if (!R.equals(val, oldV)) {
        this.clearSelect()
        if (this._valid()) this.loadOpts()
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
      let syncValue = this.resOpts[val]
      if (this.options && this.options.length) syncValue = val
      this.$emit('input', val)
      this.$emit('change', val)
      this.$emit('update:item', syncValue)
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
    loadOpts (query) {
      this.loading = true
      let manager = new Manager(this.resource, this.version)
      let params = { ...this.params }
      if (query && this.remote) {
        if (this.remoteFn) {
          params = { ...params, ...this.remoteFn(query) }
        } else {
          params[this.searchKey] = query
        }
      }
      manager.list({ params, ctx: this.ctx })
        .then(({ data: { data = [] } }) => {
          let resOpts = data.map(val => ({ ...val, id: val[this.idKey], name: val[this.nameKey] }))
          if (this.labelFormat) {
            resOpts = data.map(val => ({ ...val, id: val[this.idKey], name: this.labelFormat(val) }))
          }
          if (this.mapper) {
            resOpts = this.mapper(resOpts)
          }
          this.$emit('update:options', resOpts)
          resOpts = arrayToObj(resOpts)
          this.resOpts = resOpts
          this.disabledOpts()
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          throw error
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.base-select {
  width: 200px;
}
</style>style
