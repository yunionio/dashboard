<template>
  <div>
   <page-header :title="$t('dictionary.dns_zone')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
   <page-body>
     <list :id="listId" :cloudEnv="cloudEnv" />
   </page-body>
  </div>
</template>

<script>
import _ from 'lodash'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import List from './components/List'

export default {
  name: 'DnsZoneIndex',
  components: {
    List,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('compute_engine_brands').filter(val => !['private'].includes(val.key))
    const cloudEnv = this.$route.params?.cloudEnv
    return {
      listId: 'DnsZoneList',
      cloudEnvOptions,
      cloudEnv: cloudEnv || _.get(cloudEnvOptions, '[0].key'),
    }
  },
}
</script>
