<template>
  <div>
    <page-header :title="$t('cloudenv.text_12')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <cloudaccount-list ref="list" :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import KeepAliveMixin from '@/mixins/keepAlive'
import CloudaccountList from './components/List'

export default {
  name: 'CloudaccountIndex',
  components: {
    CloudaccountList,
  },
  mixins: [KeepAliveMixin],
  data () {
    return {
      listId: 'CloudaccountList',
      cloudEnvOptions: getCloudEnvOptions('brands'),
      cloudEnv: '',
    }
  },
}
</script>
