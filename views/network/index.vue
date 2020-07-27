<template>
  <div>
    <page-header :title="$t('network.text_565')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <network-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import NetworkList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'NetworkIndex',
  components: {
    NetworkList,
  },
  data () {
    return {
      listId: 'NetworkList',
      cloudEnvOptions: getCloudEnvOptions('network_manage_brands'),
      cloudEnv: '',
    }
  },
}
</script>
