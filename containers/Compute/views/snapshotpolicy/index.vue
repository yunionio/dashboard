<template>
  <div>
    <page-header :title="$t('compute.text_103')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <snapshot-policy-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import SnapshotPolicyList from './components/List'

export default {
  name: 'SnapshotPolicyIndex',
  components: {
    SnapshotPolicyList,
  },
  data () {
    return {
      listId: 'SnapshotpolicyList',
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
    }
  },
}
</script>
