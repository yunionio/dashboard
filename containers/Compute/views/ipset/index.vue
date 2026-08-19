<template>
  <div>
    <page-header :title="$t('compute.title.ipset')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloud-env-options="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'
import { getIpSetCloudEnvOptions } from './constants'

export default {
  name: 'IpSetIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'IpSetList',
      cloudEnvOptions: getIpSetCloudEnvOptions(),
      cloudEnv: '',
    }
  },
}
</script>
