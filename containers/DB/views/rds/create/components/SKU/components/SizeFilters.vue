<template>
  <div>
    <a-form-item :label="$t('db.text_131')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['vcpu_count']" @change="onCpuChange">
        <a-radio-button :key="cpu" :value="cpu" v-for="cpu in cpus">{{$t('db.text_125', [cpu])}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_132')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['vmem_size_mb']" @change="onMemChange">
        <a-radio-button :key="size" :value="size" v-for="size in mems_mbs">{{sizestr(size, 'M', 1024)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_133')" v-bind="formItemLayout" v-if="form.fd.provider !== 'Aws'">
      <slot name="zone" v-if="$slots.zone" />
      <a-radio-group v-else v-decorator="['zones']" @change="onZoneChange">
        <a-radio-button :key="id" :value="id" v-for="(zone, id) of zones">{{zone}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import { sizestr } from '@/utils/utils'

/**
 * 约定：specs 拉取后 options 变化时按草稿回填；落盘由页面 flush（selection）。
 */
export default {
  name: 'rdsSizeFilter',
  inject: {
    form: { default: null },
    formItemLayout: { default: null },
    scopeParams: { default: null },
    getCreateFormDraftPreferred: { default: undefined },
  },
  props: {
    rdsItem: {
      type: Object,
    },
  },
  data () {
    return {
      cpus: [],
      mems_mbs: [],
      zones: {},
      cpu_mems_mb: {},
    }
  },
  created () {
    this._fetchSpecsSeq = 0
    this._ignoreChange = false
  },
  methods: {
    sizestr,
    normalizeDraftScalar (val) {
      if (val == null || val === '') return val
      if (typeof val === 'object') {
        if (val.key != null) return val.key
        if (val.value != null) return val.value
        if (val.id != null) return val.id
      }
      return typeof val === 'string' ? val.trim() : val
    },
    readDraft (formField) {
      const preferred = typeof this.getCreateFormDraftPreferred === 'function'
        ? this.getCreateFormDraftPreferred()
        : null
      if (!preferred) return null
      return this.normalizeDraftScalar(preferred[formField])
    },
    pickFromOptions (options, draftVal) {
      const list = Array.isArray(options)
        ? options
        : (options && typeof options === 'object' ? Object.keys(options) : [])
      if (!list.length) return undefined
      const draft = this.normalizeDraftScalar(draftVal)
      if (draft != null && draft !== '') {
        const hit = list.find(item => item === draft || String(item) === String(draft))
        if (hit != null) return hit
      }
      return list[0]
    },
    setFieldQuiet (fields, callback) {
      this._ignoreChange = true
      const setter = (this.form && this.form.fc && this.form.fc.setFieldsValue) ||
        (this.form && this.form.setFieldsValue)
      if (!setter) {
        this._ignoreChange = false
        callback && callback()
        return
      }
      setter.call(this.form.fc || this.form, fields, () => {
        Object.keys(fields || {}).forEach((k) => {
          if (this.form.fd) this.$set(this.form.fd, k, fields[k])
        })
        this.$nextTick(() => {
          this._ignoreChange = false
          callback && callback()
        })
      })
    },
    onCpuChange (e) {
      if (this._ignoreChange) return
      this.getMemsMb(e)
    },
    onMemChange (e) {
      if (this._ignoreChange) return
      this.$emit('change')
    },
    onZoneChange (e) {
      if (this._ignoreChange) return
      this.$emit('change')
    },
    /** cpus options 变化后回填 */
    applyCpuFromOptions () {
      const cpu = this.pickFromOptions(this.cpus, this.readDraft('vcpu_count'))
      if (cpu == null) {
        this.mems_mbs = []
        this.$emit('change')
        return
      }
      this.setFieldQuiet({ vcpu_count: cpu }, () => this.applyMemFromOptions(cpu))
    },
    /** mem options 变化后回填 */
    applyMemFromOptions (cpuVal) {
      const cpu = cpuVal != null ? cpuVal : this.form.getFieldValue('vcpu_count')
      const memList = this.cpu_mems_mb[cpu] || this.cpu_mems_mb[String(cpu)] || []
      this.mems_mbs = Array.isArray(memList) ? memList : []
      const mem = this.pickFromOptions(this.mems_mbs, this.readDraft('vmem_size_mb'))
      if (mem == null) {
        this.$emit('change')
        return
      }
      this.setFieldQuiet({ vmem_size_mb: mem }, () => this.$emit('change'))
    },
    applyZoneFromOptions (callback) {
      const zoneKeys = Object.keys(this.zones || {})
      if (!zoneKeys.length) {
        callback && callback()
        return
      }
      const zone = this.pickFromOptions(zoneKeys, this.readDraft('zones'))
      if (zone == null) {
        callback && callback()
        return
      }
      const cur = this.form.getFieldValue('zones')
      if (cur === zone || String(cur) === String(zone)) {
        callback && callback()
        return
      }
      this.setFieldQuiet({ zones: zone }, callback)
    },
    getMemsMb (e) {
      const target = e && e.target ? e.target : {}
      const cpu = target.value || this.form.getFieldValue('vcpu_count')
      const memList = this.cpu_mems_mb[cpu] || this.cpu_mems_mb[String(cpu)] || []
      this.mems_mbs = Array.isArray(memList) ? memList : []
      // 用户改 CPU 后：内存 options 变了，按草稿回填，否则第一项（不写草稿）
      const mem = this.pickFromOptions(this.mems_mbs, this.readDraft('vmem_size_mb'))
      if (mem == null) {
        this.$emit('change')
        return
      }
      this.setFieldQuiet({ vmem_size_mb: mem }, () => this.$emit('change'))
    },
    getSpecsParams (override) {
      const paramsKeys = ['provider', 'cloudregion', 'engine', 'engine_version', 'category', 'storage_type']
      const fromFc = (this.form && this.form.getFieldsValue && this.form.getFieldsValue(paramsKeys)) || {}
      const fromFd = (this.form && this.form.fd) || {}
      const PARASM = { ...(override || {}) }
      paramsKeys.forEach((k) => {
        if (PARASM[k] != null && PARASM[k] !== '') return
        const v = fromFc[k] != null && fromFc[k] !== '' ? fromFc[k] : fromFd[k]
        if (v != null && v !== '') PARASM[k] = v
      })
      PARASM.cloudregion_id = PARASM.cloudregion
      for (let i = 0; i < paramsKeys.length; i++) {
        const k = paramsKeys[i]
        if (!PARASM[k]) {
          return null
        }
      }
      return { ...PARASM, ...this.scopeParams }
    },
    async fetchSpecs (override) {
      const PARAMS = this.getSpecsParams(override)
      if (!PARAMS) return false
      const seq = ++this._fetchSpecsSeq
      try {
        const manager = new this.$Manager('dbinstance_skus/instance-specs', 'v2')
        const { data = {} } = await manager.list({ params: PARAMS })
        if (seq !== this._fetchSpecsSeq) return false
        this.cpus = data.cpus || []
        this.cpu_mems_mb = data.cpu_mems_mb || {}
        const { zones } = data
        this.zones = zones ? (zones.zones || {}) : {}
        // specs 拉取完成 → options 变化 → 按草稿回填
        this.$nextTick(() => {
          this.applyZoneFromOptions(() => this.applyCpuFromOptions())
        })
        return true
      } catch (err) {
        if (seq !== this._fetchSpecsSeq) return false
        return false
      }
    },
  },
}
</script>
