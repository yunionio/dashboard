<template>
  <div>
    <page-header :title="$t('network.text_714')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <list
        :id="listId"
        :get-params="getParams"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'LbIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'LbList',
      cloudEnvOptions: getCloudEnvOptions('loadbalancer_engine_brands'),
      cloudEnv: '',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
