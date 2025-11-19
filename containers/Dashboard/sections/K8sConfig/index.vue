<template>
  <div>
    <a-form-item :label="$t('dashboard.text_96')" v-if="decorators.all_usage_key">
      <usage-select
        class="w-100"
        v-decorator="decorators.all_usage_key"
        :usages="allUsages"
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
            <help-link :href="metricDoc">{{$t('metricConfig.create_form.usage_link')}}</help-link>
          </template>
        </i18n>
      </div>
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
import { mapGetters } from 'vuex'
import { K8S_USAGE_CONFIG, getMetricDocs } from '@Dashboard/constants'
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
      metricDoc: getMetricDocs(this.$store.getters.scope),
    }
  },
  computed: {
    ...mapGetters(['scope']),
    allUsages () {
      const ret = []
      for (const key in K8S_USAGE_CONFIG) {
        if (K8S_USAGE_CONFIG[key].isOnlyAllPartKey && K8S_USAGE_CONFIG[key].scope === this.scope) {
          ret.push({
            key,
            scope: K8S_USAGE_CONFIG[key].scope,
            label: this.translateUsage[key] ? this.translateUsage[key] : key,
          })
        }
      }
      return ret
    },
    usages () {
      const ret = []
      const allUsageKey = this.fd?.all_usage_key || ''
      for (const key in K8S_USAGE_CONFIG) {
        const { isOnlyAllPartKey, belongAllPartKeys } = K8S_USAGE_CONFIG[key]
        if (!isOnlyAllPartKey && belongAllPartKeys && belongAllPartKeys.includes(allUsageKey) && K8S_USAGE_CONFIG[key].scope === this.scope) {
          ret.push({
            key,
            scope: K8S_USAGE_CONFIG[key].scope,
            label: this.translateUsage[key] ? this.translateUsage[key] : key,
            belongAllPartKeys: K8S_USAGE_CONFIG[key].belongAllPartKeys,
          })
        }
      }
      if (!ret.length && this.decorators.usage_key && !this.decorators.all_usage_key) {
        return this.allUsages
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
