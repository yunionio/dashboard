<template>
  <div>
    <page-header :title="$t('compute.text_101')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <snapshot-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import SnapshotList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmDiskSnapshotsIndex',
  components: {
    SnapshotList,
  },
  data () {
    return {
      listId: 'VmDiskSnapshotsList',
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
    }
  },
}
</script>
