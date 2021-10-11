<template>
  <div>
    <page-header :title="$t('network.text_571')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <wire-list
      :id="listId"
      :cloud-env="cloudEnv"
      :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import WireList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'WireIndex',
  components: {
    WireList,
  },
  data () {
    return {
      listId: 'WireList',
      cloudEnvOptions: getCloudEnvOptions('network_engine_brands').filter(item => item.key !== 'public'),
      cloudEnv: '',
    }
  },
}
</script>
