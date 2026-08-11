<template>
  <div>
    <page-header :title="$t('compute.servertemplate_baremetal')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <servertemplate-baremetal-list :cloud-env="cloudEnv" :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ServertemplateBaremetalList from './components/List'
export default {
  name: 'ServertemplateBaremetalIndex',
  components: {
    ServertemplateBaremetalList,
  },
  data () {
    return {
      cloudEnv: '',
    }
  },
  computed: {
    cloudEnvOptions: () => {
      return getCloudEnvOptions('compute_engine_brands').filter(val => ['', 'onpremise', 'private'].includes(val.key))
    },
  },
}
</script>
