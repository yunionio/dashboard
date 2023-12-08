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
      <base-select :value="cpuSockets" class="ml-1" :options="getCpuSocketsOptions(cpuSocketsOptions, cpu)" @change="cpuSocketsChangeHandle" />
    </a-form-item>
    <a-button class="mt-1" type="link" @click="showCpuSocketsHandle">{{ showCpuSockets ? '取消' : '设置插槽内核数' }}</a-button>
  </div>
</template>

<script>
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
  },
  data () {
    const max = Math.max.apply(null, this.options)
    const showMore = max > this.max
    return {
      showMore,
      opta: this.options,
      cpu: 2,
      cpuSockets: 1,
      cpuSocketsOptions: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '4', value: 4 },
      ],
      showCpuSockets: false,
    }
  },
  computed: {
    cpuSocketsExtra () {
      return '每个插槽内核数: ' + (this.cpu / this.cpuSockets)
    },
  },
  watch: {
    options () {
      const max = Math.max.apply(null, this.options)
      this.showMore = max > this.max
    },
  },
  methods: {
    change (e) {
      this.cpu = e.target.value
      this.$emit('change', e.target.value)
    },
    disableOptionHandle (item) {
      return this.disableOptions.includes(item)
    },
    showCpuSocketsHandle () {
      this.showCpuSockets = !this.showCpuSockets
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
