<template>
  <div class="d-flex">
    <a-form-item :extra="extra">
      <a-radio-group v-decorator="decorator" @change="change" :disabled="disabled">
        <a-radio-button v-show="showUnlimited" :key="0" :value="0">{{ $t('compute.unlimited') }}</a-radio-button>
        <a-radio-button v-for="item in realOptions" :value="item" :key="item" v-show="item < max || !showMore" :disabled="disableOptionHandle(item)">{{$t('compute.text_120', [ item ])}}</a-radio-button>
        <a-radio-button v-if="showMore" @click="showMore = !showMore">...</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showCpuSockets" :extra="cpuSocketsExtra">
      <a-tooltip :title="isServerRunning ? $t('compute.hot_action_notsupport') : ''">
        <base-select :disabled="isServerRunning" :value="cpuSockets" class="ml-1" :options="getCpuSocketsOptions(cpuSocketsOptions, cpu)" @change="cpuSocketsChangeHandle" />
      </a-tooltip>
    </a-form-item>
    <a-button v-if="isVMware && !isServerRunning" class="mt-1" type="link" @click="showCpuSocketsHandle">{{ showCpuSockets ? $t('common.cancel') : $t('compute.set_cpu_sockets') }}</a-button>
  </div>
</template>

<script>
import * as R from 'ramda'
import { HYPERVISORS_MAP } from '@/constants'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'CpuRadio',
  mixins: [createFormFieldDraftMixin],
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    disableOptions: {
      type: Array,
      default: () => [],
    },
    max: {
      type: Number,
      default: 32,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    extra: {
      type: String,
      default: '',
    },
    showUnlimited: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      require: true,
    },
    hypervisor: {
      validator: val => {
        if (val) return R.is(String, val)
        return true
      },
    },
    serverStatus: {
      type: String,
    },
    cpuSocketsInit: {
      type: Number,
    },
    showCpuSocketsInit: {
      type: Boolean,
    },
  },
  data () {
    const max = Math.max.apply(null, this.options)
    const showMore = max > this.max
    return {
      showMore,
      opta: this.options,
      cpu: this.decorator[1].initialValue,
      cpuSockets: 0,
      cpuSocketsOptions: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '4', value: 4 },
      ],
      showCpuSockets: this.showCpuSocketsInit || false,
    }
  },
  computed: {
    isVMware () {
      return this.hypervisor === HYPERVISORS_MAP.esxi.key
    },
    cpuSocketsExtra () {
      if (this.isServerRunning) {
        return `${this.$t('compute.core_per_sockets')}: ` + (this.cpuSocketsInit)
      }
      return `${this.$t('compute.core_per_sockets')}: ` + (this.cpu / (this.cpuSockets || 1))
    },
    isServerRunning () {
      return this.serverStatus === 'running'
    },
    realOptions () {
      if (this.isServerRunning && this.showCpuSockets) {
        return this.options.filter(v => v % this.cpuSocketsInit === 0)
      }
      return this.options
    },
  },
  watch: {
    options: {
      handler (opts) {
        const max = Math.max.apply(null, opts || [])
        this.showMore = max > this.max
        // options 变化：尝试草稿回填（不写草稿）
        this.$nextTick(() => this.tryRestoreCpuDraft(opts))
      },
    },
    cpuSockets (v) {
      if (this.form?.fi) {
        this.form.fi.cpuSockets = v
      }
    },
    showCpuSocketsInit (v) {
      this.showCpuSockets = v
    },
    cpuSocketsInit: {
      handler (v) {
        if (this.isServerRunning) {
          this.cpuSockets = this.cpu / v
        } else {
          this.cpuSockets = v
        }
      },
      immediate: true,
    },
  },
  methods: {
    change (e) {
      const cpu = e.target.value
      this.cpuSockets = this.isServerRunning ? cpu / this.cpuSocketsInit : 1
      this.cpu = cpu
      // 仅用户点选写草稿
      this.writeFormFieldDraft(cpu)
      this.$emit('change', e.target.value)
    },
    tryRestoreCpuDraft (opts) {
      if (!this.formDraftKey || !Array.isArray(opts)) return
      const fieldName = Array.isArray(this.decorator) ? this.decorator[0] : 'vcpu'
      const draft = this.readFormFieldDraft()
      // 无草稿：不覆盖，走页面原有 initialValue(2) + fetchInstanceSpecs/cpuChange
      if (draft === null || draft === undefined || draft === '') return
      let next
      // 不限存的是 0，不在 options 内，需单独回填
      if (this.showUnlimited && (draft === 0 || draft === '0')) {
        next = 0
      } else if (!opts.length) {
        return
      } else {
        const hit = this.matchFormFieldDraftInOptions(opts, draft, {
          getId: item => item,
        })
        // 草稿不在 options：回退原先默认 2 核，再不行用第一项
        if (hit != null) {
          next = hit
        } else if (opts.some(item => Number(item) === 2)) {
          next = opts.find(item => Number(item) === 2)
        } else {
          next = opts[0]
        }
      }
      if (next == null) return
      const current = this.form?.fc?.getFieldValue?.(fieldName)
      if (current === next || String(current) === String(next)) return
      if (this.form?.fc) {
        this.form.fc.setFieldsValue({ [fieldName]: next })
      }
      this.cpu = next
      this.$emit('change', next)
    },
    serializeFormFieldDraft () {
      const fieldName = Array.isArray(this.decorator) ? this.decorator[0] : 'vcpu'
      const value = this.form?.fc?.getFieldValue?.(fieldName)
      // 0 表示不限，需可序列化
      return value != null && value !== '' ? value : undefined
    },
    disableOptionHandle (item) {
      return this.disableOptions.includes(item)
    },
    showCpuSocketsHandle () {
      this.showCpuSockets = !this.showCpuSockets
      this.form.fi.showCpuSockets = this.showCpuSockets
    },
    cpuSocketsChangeHandle (v) {
      this.cpuSockets = v
    },
    getCpuSocketsOptions (cpuSocketsOptions, cpu) {
      return cpuSocketsOptions.filter(item => {
        return cpu % item.value === 0
      })
    },
  },
}
</script>
