<template>
  <div>
    <page-header :title="title" :current-tab.sync="createCloudEnv" :tabs="cloudEnvOptions" />
    <component :is="createCloudEnv" :cloudEnv="createCloudEnv" :initFormData="initFormData" :isInitForm="isInitForm" />
  </div>
</template>
<script>
import workflowMixin from '@/mixins/workflow'
import WindowsMixin from '@/mixins/windows'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import Onpremise from './IDC'
import Private from './Private'

export default {
  name: 'BaremetalCreateIndex',
  components: {
    Onpremise,
    Private,
  },
  mixins: [WindowsMixin, workflowMixin],
  props: {
    cloudEnv: {
      type: String,
      default: 'onpremise',
    },
  },
  data () {
    const paramsData = this.$route.params?.data || {}
    return {
      createCloudEnv: this.$route.query.cloud_env || this.$route.query.type || 'onpremise',
      initFormData: paramsData,
    }
  },
  computed: {
    cloudEnvOptions: () => {
      return getCloudEnvOptions('compute_engine_brands').filter(val => ['onpremise', 'private'].includes(val.key))
    },
    isInitForm () {
      return !!this.initFormData?.extraData?.formType && this.$route.query.workflow
    },
    isInstallOperationSystem () {
      return !!this.$route.query.host_id
    },
    title () {
      if (this.isInstallOperationSystem) return this.$t('compute.text_298')
      const base = this.$t('compute.text_299')
      return this.$route.query.workflow ? `${base}(${this.$t('common.modify_workflow')})` : base
    },
  },
  watch: {
    cloudEnv (val) {
      if (!val) {
        this.createCloudEnv = 'onpremise'
      } else {
        this.createCloudEnv = val
      }
    },
  },
  created () {
  },
  methods: {
  },
}
</script>
