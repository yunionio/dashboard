<template>
  <div>
    <page-header
     :title="$t('compute.text_111')"
     :tabs="cloudEnvOptions"
     :current-tab.sync="cloudEnv"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <host-list
        :get-params="listParams"
        :id="listId"
        :filterParams="filterParams"
        statusResKey="host"
        :tableOverviewIndexs="tableOverviewIndexs"
        @refresh="refreshHandle"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import HostList from './components/List'

export default {
  name: 'HostIndex',
  components: {
    HostList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'HostList',
      listParams: {
        details: true,
        baremetal: false,
      },
      statusNormalList: ['running'],
    }
  },
}
</script>
