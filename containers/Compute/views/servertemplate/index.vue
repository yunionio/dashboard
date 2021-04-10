<template>
  <div>
    <page-header :title="$t('compute.text_873')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <servertemplate-list :id="listId" :cloud-env="cloudEnv" :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import ServertemplateList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'ServertemplateIndex',
  components: {
    ServertemplateList,
  },
  data () {
    return {
      listId: 'ServertemplateList',
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
    }
  },
}
</script>
