<template>
  <div>
    <page-header title="云账号" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <cloudaccount-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import CloudaccountList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'CloudaccountIndex',
  components: {
    CloudaccountList,
  },
  data () {
    return {
      listId: 'CloudaccountList',
      cloudEnvOptions: getCloudEnvOptions('brands'),
      cloudEnv: '',
    }
  },
}
</script>
