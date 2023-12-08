<template>
  <div class="d-flex">
    <a-form-item :extra="extra">
      <a-radio-group v-decorator="decorator" @change="change" :disabled="disabled">
        <a-radio-button v-show="showUnlimited" :key="0" :value="0">{{ $t('compute.unlimited') }}</a-radio-button>
        <a-radio-button v-for="item in options" :value="item" :key="item" v-show="item < max || !showMore" :disabled="disableOptionHandle(item)">{{$t('compute.text_120', [ item ])}}</a-radio-button>
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

export default {
  name: 'CpuRadio',
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
      cpuSockets: this.cpuSocketsInit || 1,
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
      return `${this.$t('compute.core_per_sockets')}: ` + (this.cpu / this.cpuSockets)
    },
    isServerRunning () {
      return this.serverStatus === 'running'
    },
  },
  watch: {
    options () {
      const max = Math.max.apply(null, this.options)
      this.showMore = max > this.max
    },
    cpuSockets (v) {
      this.form.fi.cpuSockets = v
    },
    showCpuSocketsInit (v) {
      this.showCpuSockets = v
    },
  },
  methods: {
    change (e) {
      this.cpu = e.target.value
      this.cpuSockets = 1
      this.$emit('change', e.target.value)
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
