<template>
  <div>
    <page-header :title="$t('network.text_221')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <eip-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import EipList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'EipIndex',
  components: {
    EipList,
  },
  data () {
    return {
      listId: 'EipList',
      cloudEnvOptions: getCloudEnvOptions('network_manage_brands'),
      cloudEnv: '',
    }
  },
}
</script>
