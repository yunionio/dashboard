<template>
  <div>
    <page-header :title="$t('compute.text_102')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <snapshot-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import SnapshotList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceSnapshotsIndex',
  components: {
    SnapshotList,
  },
  data () {
    return {
      listId: 'VmInstanceSnapshotsList',
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
    }
  },
}
</script>
