<template>
  <div>
    <page-header :title="$t('dictionary.dbinstance')" />
    <page-body>
      <rds-list :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import rdsList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'RDSIndex',
  components: {
    rdsList,
  },
  data () {
    return {
      listId: 'RDSList',
      cloudEnvOptions: getCloudEnvOptions('rds_engine_brands'),
      cloudEnv: '',
    }
  },
  methods: {
    createServer () {
      this.$router.push('/rds/create')
    },
  },
}
</script>
