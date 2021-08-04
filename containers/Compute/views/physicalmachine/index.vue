<template>
  <div>
    <page-header :title="$t('compute.text_112')">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <physicalmachine-list
        :getParams="getParams"
        :id="listId"
        :filterParams="filterParams"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import PhysicalmachineList from './components/List'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'PhysicalmachineIndex',
  components: {
    PhysicalmachineList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'PhysicalmachineList',
      getParams: {
        details: true,
        baremetal: true,
        host_type: 'baremetal',
      },
      resStaticsResource: 'hosts',
    }
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
      baremetal: true,
      host_type: 'baremetal',
    })
  },
}
</script>
