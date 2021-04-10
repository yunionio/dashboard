<template>
  <div>
    <page-header :title="$t('dictionary.elasticcache')" />
    <page-body>
      <redis-list :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import RedisList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceIndex',
  components: {
    RedisList,
  },
  data () {
    return {
      listId: 'RedisList',
      cloudEnvOptions: getCloudEnvOptions('redis_engine_brands'),
      cloudEnv: '',
    }
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
  },
}
</script>
