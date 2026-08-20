<template>
  <div>
    <div class="d-flex" v-for="(item) in labelList" :key="item.key">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input-group compact v-if="keyBaseSelectProps">
          <div class="d-flex">
            <a-input class="oc-addonBefore ant-input-group-addon" style="width: 80px;" :defaultValue="keyLabel" readonly />
            <base-select v-decorator="decorators.key(item.key)" v-bind="getBindProps(item.key)" @change="onPairChange" />
          </div>
        </a-input-group>
        <a-input v-else :addonBefore="keyLabel" v-decorator="decorators.key(item.key)" :placeholder="keyPlaceholder" @change="onPairChange" />
      </a-form-item>
      <div class="mx-3"> = </div>
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input :addonBefore="valueLabel" v-decorator="decorators.value(item.key)" :placeholder="valuePlaceholder" @change="onPairChange" />
      </a-form-item>
      <a-button v-if="firstCanDelete || labelList.length > 1" shape="circle" icon="minus" size="small" @click="del(item)" class="mt-2 ml-2" />
    </div>
    <div class="d-flex align-items-center">
      <a-tooltip :title="disableConf?.tooltip">
        <a-button type="primary" :disabled="disableConf?.disabled" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" :disabled="disableConf?.disabled" @click="add">{{$t('compute.repo.add', [ title ])}}</a-button>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import i18n from '@/locales'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'ContainerLables',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: i18n.t('compute.repo.label'),
    },
    keyLabel: {
      type: String,
      default: i18n.t('compute.repo.key'),
    },
    valueLabel: {
      type: String,
      default: i18n.t('compute.repo.value'),
    },
    decorators: {
      type: Object,
      validator: val => R.is(Function, val.key) && R.is(Function, val.value),
    },
    keyPlaceholder: {
      type: String,
      default: '',
    },
    valuePlaceholder: {
      type: String,
      default: '',
    },
    keyBaseSelectProps: {
      type: Object,
    },
    firstCanDelete: {
      type: Boolean,
      default: true,
    },
    checkedValues: {
      type: Array,
      default: () => [],
    },
    disableConf: {
      type: Object,
      default: () => { },
    },
    /** 优先于 inject，避免 collapse 内 inject 不稳定 */
    createForm: {
      type: Object,
      default: null,
    },
    /**
     * 工单/草稿端口映射：[{ port, host_port }] 或 [{ key, value }]
     * 挂载后自动回填
     */
    initPairs: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      labelList: [],
      pendingPairs: [],
    }
  },
  inject: {
    form: {
      default: null,
    },
  },
  computed: {
    effectiveForm () {
      return this.createForm || this.form
    },
  },
  watch: {
    labelList: {
      handler (val) {
        this.$emit('label-change', val)
      },
      deep: true,
    },
    initPairs: {
      handler (val) {
        if (Array.isArray(val) && val.length) {
          this.initData(val)
        }
      },
      immediate: true,
    },
    'keyBaseSelectProps.options': {
      handler () {
        if (!this.pendingPairs.length || !this.keyBaseSelectProps?.options?.length) return
        this.writePendingPairs()
      },
      deep: true,
    },
  },
  created () {
    this._labelsDraftRestoring = false
  },
  methods: {
    add () {
      this.labelList.push({ key: uuid() })
      this.$nextTick(() => this.persistLabelsDraft())
    },
    del (item) {
      const index = this.labelList.findIndex(val => val.key === item.key)
      this.labelList.splice(index, 1)
      this.$nextTick(() => this.persistLabelsDraft())
    },
    reset () {
      this.labelList = []
      this.pendingPairs = []
    },
    onPairChange () {
      this.$nextTick(() => this.persistLabelsDraft())
    },
    normalizePairs (pairs = []) {
      return (pairs || []).map((pair) => {
        if (!pair || typeof pair !== 'object') return null
        // 兼容 port_mappings: { port, host_port } 与 Labels: { key, value }
        const key = pair.key != null ? pair.key : pair.port
        const value = pair.value != null ? pair.value : pair.host_port
        if (key == null || key === '') return null
        return { key, value }
      }).filter(Boolean)
    },
    /** 有 keyBaseSelect 时：options 空不回填；非空只保留命中 key */
    filterPairsByKeyOptions (pairs = []) {
      if (!this.keyBaseSelectProps) return pairs
      const options = this.keyBaseSelectProps.options
      if (!Array.isArray(options) || !options.length) return []
      const ids = new Set(options.map(o => o.id ?? o.key))
      return pairs.filter(p => ids.has(p.key))
    },
    /** pairs: [{ key, value }] 或 [{ port, host_port }] */
    initData (pairs = []) {
      const normalized = this.filterPairsByKeyOptions(this.normalizePairs(pairs))
      if (!normalized.length) return
      this._labelsDraftRestoring = true
      this.pendingPairs = normalized
      this.labelList = normalized.map(() => ({ key: uuid() }))
      this.$nextTick(() => {
        this.writePendingPairs()
        // 字段注册后再补一次
        setTimeout(() => this.writePendingPairs(), 100)
        setTimeout(() => {
          this.writePendingPairs()
          this._labelsDraftRestoring = false
        }, 500)
      })
    },
    writePendingPairs () {
      const form = this.effectiveForm
      if (!form?.fc || !this.labelList.length || !this.pendingPairs.length) return
      // options 晚于草稿就绪时再滤一次
      const pairs = this.filterPairsByKeyOptions(this.pendingPairs)
      if (pairs.length !== this.pendingPairs.length) {
        this.pendingPairs = pairs
        this.labelList = pairs.map(() => ({ key: uuid() }))
        if (!pairs.length) return
      }
      const values = {}
      pairs.forEach((pair, i) => {
        const rowKey = this.labelList[i]?.key
        if (!rowKey) return
        const keyField = this.decorators.key(rowKey)?.[0]
        const valueField = this.decorators.value(rowKey)?.[0]
        if (keyField) values[keyField] = pair.key
        if (valueField && pair.value != null && pair.value !== '') {
          values[valueField] = pair.value
        }
      })
      form.fc.setFieldsValue(values)
      // 同步嵌套对象到 fd，便于 GenCreateData / 草稿序列化
      if (form.fd) {
        const containerPorts = { ...(form.fd.containerPorts || {}) }
        const hostPorts = { ...(form.fd.hostPorts || {}) }
        this.labelList.forEach((row, i) => {
          const pair = pairs[i]
          if (!pair || !row?.key) return
          containerPorts[row.key] = pair.key
          if (pair.value != null && pair.value !== '') {
            hostPorts[row.key] = pair.value
          }
        })
        this.$set(form.fd, 'containerPorts', containerPorts)
        this.$set(form.fd, 'hostPorts', hostPorts)
      }
    },
    getBindProps (key) {
      const { options } = this.keyBaseSelectProps
      const bindProps = {
        ...this.keyBaseSelectProps,
        options: options.filter(v => {
          if (this.checkedValues?.length) {
            return !this.checkedValues.includes(v.id)
          }
          return true
        }),
      }
      return bindProps
    },
    getCreateFormFieldDraftSnapshot () {
      const form = this.effectiveForm
      if (!form?.fc) return null
      if (!this.labelList.length) return null
      const pairs = this.labelList.map((row) => {
        const keyField = this.decorators.key(row.key)?.[0]
        const valueField = this.decorators.value(row.key)?.[0]
        if (!keyField) return null
        const key = form.fc.getFieldValue(keyField)
        if (key == null || key === '') return null
        const value = valueField ? form.fc.getFieldValue(valueField) : undefined
        return { key, value }
      }).filter(Boolean)
      return pairs.length ? pairs : null
    },
    applyCreateFormFieldDraft (draft) {
      if (!Array.isArray(draft) || !draft.length) return
      this.initData(draft)
    },
    persistLabelsDraft () {
      if (this._labelsDraftRestoring) return
      this.persistFormFieldDraftSnapshot()
    },
    persistFormFieldDraftSnapshot (options = {}) {
      const data = this.serializeFormFieldDraft()
      if (data === null || data === undefined) {
        this.clearFormFieldDraft()
        return
      }
      this.writeFormFieldDraft(data, options)
    },
    flushFormFieldDraftOnSubmit () {
      const data = this.serializeFormFieldDraft()
      if (data === null || data === undefined) {
        this.clearFormFieldDraft()
        return
      }
      this.writeFormFieldDraft(data, { fromSubmit: true })
    },
  },
}
</script>
