<template>
  <div>
    <page-header title="实例" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <list :id="listId" :get-params="getParams" :cloud-env="cloudEnv" />
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
      cloudEnvOptions: getCloudEnvOptions('brands').filter(v => v.key !== 'private'),
      cloudEnv: '',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
