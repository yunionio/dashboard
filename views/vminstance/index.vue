<template>
  <div>
    <page-header :title="$t('compute.text_91')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <server-status-tab
        @getStatusCheckArr="getStatusCheckArr" />
      <vm-instance-list
        :id="listId"
        :cloud-env="cloudEnv"
        :filterParams="filterParams" />
    </page-body>
  </div>
</template>

<script>
import VmInstanceList from './components/List'
import ServerStatusTab from './components/ServerStatusTab'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
    ServerStatusTab,
  },
  data () {
    return {
      listId: 'VMInstanceList',
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
      filterParams: {},
    }
  },
  methods: {
    getStatusCheckArr (statusCheckArr, statusArr) {
      if (statusCheckArr && statusCheckArr.length > 0) {
        this.filterParams = {
          statusCheckArr: statusCheckArr,
          statusArr: statusArr,
        }
      } else {
        this.filterParams = {
          statusCheckArr: [],
        }
      }
    },
  },
}
</script>
