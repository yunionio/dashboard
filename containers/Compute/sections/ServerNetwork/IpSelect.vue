<template>
  <base-select
    v-if="showType === 'select'"
    :value="value"
    :options="options"
    @change="change"
    :select-props="{
      allowClear: true,
      loading: loading,
      placeholder: $t('common.tips.select', ['IP']),
    }" />
  <a-input v-else :value="value" @change="ipChange" />
</template>

<script>
import { uuid } from '@/utils/utils'

export default {
  props: {
    value: {
      required: true,
    },
    network: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      loading: false,
      options: [],
      showType: 'select',
    }
  },
  watch: {
    'network.id': {
      handler (val) {
        if (val) {
          this.fetchIps(val)
        } else {
          this.options = []
          this.$emit('change', null)
        }
      },
      immediate: true,
    },
  },
  created () {
    this.$iM = new this.$Manager('networks', 'v1')
  },
  methods: {
    async fetchIps (val) {
      const { ports = 0 } = this.network
      if (ports > 1024) {
        this.showType = 'input'
        this.$emit('change', null)
        return
      }
      try {
        this.loading = true
        const res = await new this.$Manager(`networks/${val}/available-addresses`).list({
          params: {
            $t: uuid(),
            scope: this.$store.getters.scope,
          },
        })
        const { addresses = [] } = res.data || {}
        this.options = addresses.map(ip => {
          return {
            id: ip,
            name: ip,
          }
        })
        console.log('initial value ', this.value, addresses)
        if (!addresses.includes(this.value)) {
          this.options.unshift({
            ip: this.value,
            name: this.value,
          })
          // this.$emit('change', null)
        }
        this.showType = 'select'
        this.loading = false
      } catch (err) {
        this.loading = false
        this.showType = 'input'
        throw err
      }
    },
    change (val) {
      this.$emit('change', val)
    },
    ipChange (e) {
      this.$emit('change', e.target.value)
    },
  },
}
</script>
