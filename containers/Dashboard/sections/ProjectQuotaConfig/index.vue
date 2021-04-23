<template>
  <div>
    <a-form-item :label="$t('dashboard.text_96')" v-if="decorators.all_usage_key">
      <usage-select
        class="w-100"
        v-decorator="decorators.all_usage_key"
        :usages="usages"
        @change="allUsageChange" />
      <div slot="extra">
        <i18n path="metricConfig.create_form.all_usage_extra">
          <template #link>
            <help-link :href="metricDoc">{{$t('metricConfig.create_form.all_usage_link')}}</help-link>
          </template>
        </i18n>
      </div>
    </a-form-item>
    <a-form-item :label="usageLabel || $t('dashboard.text_97')" v-if="decorators.usage_key">
      <usage-select
        class="w-100"
        v-decorator="decorators.usage_key"
        :usages="usages"
        @change="usageChange" />
      <div slot="extra">
        <i18n :path="usageLabel?'metricConfig.create_form.metric_extra':'metricConfig.create_form.usage_extra'">
          <template #link>
            <help-link :href="quotaDoc">{{$t('metricConfig.create_form.usage_link')}}</help-link>
          </template>
        </i18n>
      </div>
    </a-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { PROJECT_QUOTA_CONFIG, getMetricDocs } from '@Dashboard/constants'
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
      metricDoc: getMetricDocs(this.$store.getters.scope),
    }
  },
  computed: {
    ...mapGetters(['scope']),
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
