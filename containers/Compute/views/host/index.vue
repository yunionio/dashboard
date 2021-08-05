<template>
  <div>
    <page-header :title="$t('compute.text_111')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <host-list
        :get-params="listParams"
        :id="listId"
        :filterParams="filterParams"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import HostList from './components/List'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'HostIndex',
  components: {
    HostList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'HostList',
      listParams: {
        details: true,
        baremetal: false,
      },
      resStaticsResource: 'hosts',
    }
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
      baremetal: false,
    })
  },
}
</script>
