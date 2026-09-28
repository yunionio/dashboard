<template>
  <div>
    <div class="d-flex" v-for="(item) in labelList" :key="item.key">
      <a-form-item v-if="showProtocol && decorators.protocol" :wrapperCol="{ span: 24 }" class="labels-protocol mb-0">
        <a-select
          v-decorator="getDecorator(item.key, 'protocol')"
          :disabled="isLocked(item)"
          style="width: 88px">
          <a-select-option v-for="opt in protocolOptions" :key="opt.id" :value="opt.id">
            {{ opt.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input-group compact v-if="keyBaseSelectProps">
          <div class="d-flex">
            <a-input class="oc-addonBefore ant-input-group-addon" style="width: 80px;" :defaultValue="keyLabel" readonly />
            <base-select v-decorator="getDecorator(item.key, 'key')" v-bind="getBindProps(item.key, item)" />
          </div>
        </a-input-group>
        <a-input v-else :addonBefore="keyLabel" v-decorator="getDecorator(item.key, 'key')" :placeholder="keyPlaceholder" :disabled="isLocked(item)" />
      </a-form-item>
      <div class="mx-3"> = </div>
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-tooltip v-if="valueTooltip" :title="valueTooltip" placement="top">
          <a-input :addonBefore="valueLabel" v-decorator="getDecorator(item.key, 'value')" :placeholder="valuePlaceholder" :disabled="isLocked(item)" />
        </a-tooltip>
        <a-input v-else :addonBefore="valueLabel" v-decorator="getDecorator(item.key, 'value')" :placeholder="valuePlaceholder" :disabled="isLocked(item)" />
      </a-form-item>
      <a-button v-if="(firstCanDelete || labelList.length > 1) && !isLocked(item)" shape="circle" icon="minus" size="small" @click="del(item)" class="mt-2 ml-2" />
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

const DEFAULT_PROTOCOL_OPTIONS = [
  { id: 'tcp', name: 'TCP' },
  { id: 'udp', name: 'UDP' },
]

const PORT_MAPPING_FD_KEYS = [
  'networkContainerPorts',
  'networkHostPorts',
  'networkPortProtocols',
  'containerPorts',
  'hostPorts',
  'portProtocols',
]

export default {
  name: 'ContainerLables',
  props: {
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
    valueTooltip: {
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
     * 工单端口映射：[{ port, host_port, protocol }] 或 [{ key, value, protocol }]
     * 挂载后自动回填
     */
    initPairs: {
      type: Array,
      default: () => [],
    },
    /**
     * 需要锁定的环境变量 key：命中的行不可编辑、不可删除
     * 用于容器镜像提供的默认环境变量
     */
    readonlyKeys: {
      type: Array,
      default: () => [],
    },
    /** 端口映射：展示协议（TCP/UDP）选择 */
    showProtocol: {
      type: Boolean,
      default: false,
    },
    protocolOptions: {
      type: Array,
      default: () => DEFAULT_PROTOCOL_OPTIONS,
    },
  },
  data () {
    return {
      labelList: [],
      pendingPairs: [],
      // 行 uuid -> 环境变量 key，用于判断该行是否来自容器镜像
      rowEnvKey: {},
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
      immediate: true,
      handler () {
        if (!this.pendingPairs.length || !this.keyBaseSelectProps?.options?.length) return
        this.writePendingPairs()
      },
      deep: true,
    },
  },
  methods: {
    add () {
      this.labelList.push({ key: uuid() })
    },
    del (item) {
      const index = this.labelList.findIndex(val => val.key === item.key)
      this.labelList.splice(index, 1)
    },
    reset () {
      this.labelList = []
      this.pendingPairs = []
      this.rowEnvKey = {}
    },
    normalizePairs (pairs = []) {
      return (pairs || []).map((pair) => {
        if (!pair || typeof pair !== 'object') return null
        // 兼容 port_mappings: { port, host_port, protocol } 与 Labels: { key, value, protocol }
        const key = pair.key != null ? pair.key : pair.port
        const value = pair.value != null ? pair.value : pair.host_port
        if (key == null || key === '') return null
        const protocol = (pair.protocol || 'tcp').toLowerCase()
        return { key, value, protocol }
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
    /** pairs: [{ key, value, protocol? }] 或 [{ port, host_port, protocol? }] */
    initData (pairs = []) {
      const normalized = this.filterPairsByKeyOptions(this.normalizePairs(pairs))
      if (!normalized.length) return
      this.pendingPairs = normalized
      this.labelList = normalized.map(() => ({ key: uuid() }))
      this.syncRowEnvKey()
      this.$nextTick(() => {
        this.writePendingPairs()
        this.$nextTick(() => {
          this.writePendingPairs()
        })
      })
    },
    /** 记录 行 uuid -> env key 的映射，供 readonlyKeys 判断锁定行 */
    syncRowEnvKey (pairs = this.pendingPairs) {
      const mapping = {}
      pairs.forEach((pair, i) => {
        const rowKey = this.labelList[i]?.key
        if (rowKey && pair?.key != null && pair.key !== '') {
          mapping[rowKey] = pair.key
        }
      })
      this.rowEnvKey = mapping
    },
    isLocked (item) {
      const envKey = this.rowEnvKey[item?.key]
      if (envKey == null) return false
      return (this.readonlyKeys || []).includes(envKey)
    },
    /**
     * 取该行的 decorator 定义；锁定行去掉 required 校验，
     * 避免用户被自己无法编辑的值（如镜像的 value_from）卡住提交
     */
    getDecorator (rowKey, type) {
      const decFn = this.decorators[type]
      if (!R.is(Function, decFn)) return undefined
      const dec = decFn(rowKey)
      const item = this.labelList.find(row => row.key === rowKey)
      if (!item || !this.isLocked(item)) return dec
      const options = dec && dec[1]
      if (!options || !options.rules) return dec
      const rules = options.rules.filter(rule => !rule.required)
      if (rules.length === options.rules.length) return dec
      return [dec[0], { ...options, rules }]
    },
    writePendingPairs () {
      const form = this.effectiveForm
      if (!form?.fc || !this.labelList.length || !this.pendingPairs.length) return
      const pairs = this.filterPairsByKeyOptions(this.pendingPairs)
      if (pairs.length !== this.pendingPairs.length) {
        this.pendingPairs = pairs
        this.labelList = pairs.map(() => ({ key: uuid() }))
        if (!pairs.length) return
      }
      this.syncRowEnvKey(pairs)
      const values = {}
      pairs.forEach((pair, i) => {
        const rowKey = this.labelList[i]?.key
        if (!rowKey) return
        const keyField = this.decorators.key(rowKey)?.[0]
        const valueField = this.decorators.value(rowKey)?.[0]
        const protocolField = this.showProtocol && R.is(Function, this.decorators.protocol)
          ? this.decorators.protocol(rowKey)?.[0]
          : null
        if (keyField) values[keyField] = pair.key
        if (valueField && pair.value != null && pair.value !== '') {
          values[valueField] = pair.value
        }
        if (protocolField) {
          values[protocolField] = pair.protocol || 'tcp'
        }
      })
      form.fc.setFieldsValue(values)
      // 按实际表单字段同步到 fd（支持 networkContainerPorts 嵌套与旧 containerPorts）
      if (form.fd) {
        const all = form.fc.getFieldsValue() || {}
        PORT_MAPPING_FD_KEYS.forEach((k) => {
          if (all[k] != null) {
            this.$set(form.fd, k, all[k])
          }
        })
      }
    },
    getBindProps (key, item) {
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
      if (item && this.isLocked(item)) {
        bindProps.disabled = true
      }
      return bindProps
    },
  },
}
</script>

<style lang="less" scoped>
.labels-protocol {
  margin-right: 8px;
}
</style>
