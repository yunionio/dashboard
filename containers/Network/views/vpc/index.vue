<template>
  <div>
   <page-header :title="$t('dictionary.vpc')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
   <page-body>
     <list :id="listId" :cloud-env="cloudEnv" :get-params="getParams" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VPCIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'VpcList',
      cloudEnvOptions: getCloudEnvOptions('network_manage_brands'),
      cloudEnv: '',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
