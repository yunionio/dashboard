<template>
  <div>
    <page-header :title="$t('compute.text_92')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :loading="statisticsLoading"
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <baremetal-list
        :id="listId"
        :cloud-env="cloudEnv"
        :filterParams="filterParams"
        @refresh="refreshHandle"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import BaremetalList from './components/List'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'

export default {
  name: 'BaremetalIndex',
  components: {
    BaremetalList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'BaremetalList',
      cloudEnvOptions: [
        { key: '', label: this.$t('compute.text_4') },
      ],
      cloudEnv: '',
      resStaticsResource: 'servers',
    }
  },
}
</script>
