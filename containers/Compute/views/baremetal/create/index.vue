<template>
  <div>
    <page-header :title="isInstallOperationSystem ? $t('compute.text_298') : $t('compute.text_299')" :current-tab.sync="createCloudEnv" :tabs="cloudEnvOptions" />
    <component :is="createCloudEnv" />
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
    return {
      createCloudEnv: this.$route.query.cloud_env || 'onpremise',
    }
  },
  computed: {
    cloudEnvOptions: () => {
      return getCloudEnvOptions('compute_engine_brands').filter(val => ['onpremise', 'private'].includes(val.key))
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
