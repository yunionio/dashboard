<template>
  <div>
    <page-header :title="$t('dictionary.elasticcache')"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <redis-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="redis"
        @refresh="refreshHandle"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import RedisList from './components/List'

export default {
  name: 'VmInstanceIndex',
  components: {
    RedisList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'RedisList',
      cloudEnvOptions: getCloudEnvOptions('redis_brands'),
      cloudEnv: '',
      statusNormalList: ['running'],
    }
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
  },
}
</script>
