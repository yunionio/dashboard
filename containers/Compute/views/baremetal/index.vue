<template>
  <div>
    <page-header :title="$t('compute.text_92')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <baremetal-list
        :id="listId"
        :cloud-env="cloudEnv"
        :filterParams="filterParams"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import ResStatusTab from '@/sections/ResStatusTab'
import BaremetalList from './components/List'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'BaremetalIndex',
  components: {
    BaremetalList,
    ResStatusTab,
  },
  mixins: [ResStatisticsMixin],
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
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
      baremetal: true,
    })
  },
}
</script>
