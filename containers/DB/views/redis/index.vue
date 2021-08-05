<template>
  <div>
    <page-header :title="$t('dictionary.elasticcache')">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <redis-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusRes="redis"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import RedisList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'VmInstanceIndex',
  components: {
    RedisList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'RedisList',
      cloudEnvOptions: getCloudEnvOptions('redis_engine_brands'),
      cloudEnv: '',
      resStaticsResource: 'elasticcaches',
    }
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
    })
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
  },
}
</script>
