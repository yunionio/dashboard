<template>
  <div>
    <page-header
     :title="$t('compute.text_112')"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <physicalmachine-list
        :getParams="getParams"
        :id="listId"
        :filterParams="filterParams"
        statusResKey="host"
        @refresh="refreshHandle"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import PhysicalmachineList from './components/List'

export default {
  name: 'PhysicalmachineIndex',
  components: {
    PhysicalmachineList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'PhysicalmachineList',
      getParams: {
        details: true,
        baremetal: true,
        host_type: 'baremetal',
      },
      statusNormalList: ['running'],
    }
  },
}
</script>
