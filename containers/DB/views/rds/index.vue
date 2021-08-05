<template>
  <div>
    <page-header :title="$t('dictionary.dbinstance')">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <rds-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusRes="rds"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import rdsList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'RDSIndex',
  components: {
    rdsList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'RDSList',
      cloudEnvOptions: getCloudEnvOptions('rds_engine_brands'),
      cloudEnv: '',
      resStaticsResource: 'dbinstances',
    }
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
    })
  },
  methods: {
    createServer () {
      this.$router.push('/rds/create')
    },
  },
}
</script>
