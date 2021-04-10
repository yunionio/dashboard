<template>
  <div>
    <a-form-item :label="$t('dashboard.text_96')" v-if="decorators.all_usage_key">
      <usage-select
        class="w-100"
        v-decorator="decorators.all_usage_key"
        :usages="usages"
        @change="allUsageChange" />
    </a-form-item>
    <a-form-item :label="usageLabel || $t('dashboard.text_97')" v-if="decorators.usage_key">
      <usage-select
        class="w-100"
        v-decorator="decorators.usage_key"
        :usages="usages"
        @change="usageChange" />
    </a-form-item>
  </div>
</template>

<script>
import { PROJECT_QUOTA_CONFIG } from '@Dashboard/constants'
import UsageSelect from '@Dashboard/sections/QuotaConfig/UsageSelect'

export default {
  name: 'ProjectQuotaConfig',
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
    type: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      translateUsage: this.$t('project_quota_usage'),
    }
  },
  computed: {
    projectQuotaConfig () {
      return PROJECT_QUOTA_CONFIG[this.type]
    },
    usages () {
      const ret = []
      for (const key in this.projectQuotaConfig) {
        ret.push({
          key,
          label: this.translateUsage[key] ? this.translateUsage[key] : key,
        })
      }
      return ret
    },
  },
  methods: {
    allUsageChange (allUsage) {
      this.$emit('update:all_usage_key', allUsage)
    },
    usageChange (usage) {
      this.$emit('update:usage_key', usage)
    },
  },
}
</script>
