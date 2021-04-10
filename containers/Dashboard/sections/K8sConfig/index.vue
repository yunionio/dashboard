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
    <a-form-item :label="$t('dashboard.usage_metric_name')" class="mb-0" v-if="decorators.usage_label">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input class="w-100" v-decorator="decorators.usage_label" />
      </a-form-item>
    </a-form-item>
    <a-form-item :label="$t('dashboard.remaining_usage_metric_name')" class="mb-0" v-if="decorators.un_usage_label">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input class="w-100" v-decorator="decorators.un_usage_label" />
      </a-form-item>
    </a-form-item>
  </div>
</template>

<script>
import { K8S_USAGE_CONFIG } from '@Dashboard/constants'
import UsageSelect from '@Dashboard/sections/QuotaConfig/UsageSelect'

export default {
  name: 'K8sConfig',
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
    fd: {
      type: Object,
      required: false,
    },
    usageLabel: String,
  },
  data () {
    return {
      translateUsage: this.$t('k8s_usage'),
    }
  },
  computed: {
    usages () {
      const ret = []
      for (const key in K8S_USAGE_CONFIG) {
        ret.push({
          key,
          scope: K8S_USAGE_CONFIG[key].scope,
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
