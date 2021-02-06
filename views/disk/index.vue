<template>
  <div>
    <page-header :title="$t('compute.text_100')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <disk-list :id="listId" :getParams="getParams" :cloud-env="cloudEnv" :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import DiskList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'DiskIndex',
  components: {
    DiskList,
  },
  data () {
    return {
      listId: 'DiskList',
      getParams: {
        details: true,
        'filter.0': 'disk_type.notin(volume)',
      },
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
    }
  },
}
</script>
