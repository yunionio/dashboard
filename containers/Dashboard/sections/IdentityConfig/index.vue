<template>
  <a-form-item :label="usageLabel || $t('dashboard.text_97')">
    <usage-select
      class="w-100"
      v-decorator="decorators.usage_key"
      :usages="usages"
      @change="usageChange" />
  </a-form-item>
</template>

<script>
import { USAGE_CONFIG, USAGE_SOURCE_IDENTITY } from '@Dashboard/constants'
import UsageSelect from '@Dashboard/sections/QuotaConfig/UsageSelect'

export default {
  name: 'IdentityConfig',
  components: {
    UsageSelect,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    fc: {
      type: Object,
      required: true,
    },
    usageLabel: String,
  },
  data () {
    return {
      translateUsage: this.$t('usage'),
    }
  },
  computed: {
    usages () {
      const ret = []
      for (const key in USAGE_CONFIG) {
        if (USAGE_CONFIG[key].usageSource !== USAGE_SOURCE_IDENTITY) {
          continue
        }
        ret.push({
          key,
          label: this.translateUsage[key] ? this.translateUsage[key] : key,
        })
      }
      return ret
    },
  },
  methods: {
    usageChange (usage) {
      this.$emit('update:usage_key', usage)
    },
  },
}
</script>
