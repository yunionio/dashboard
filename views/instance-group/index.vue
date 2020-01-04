<template>
  <div>
    <page-header title="主机组" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <instance-group-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import InstanceGroupList from './components/List'

export default {
  name: 'InstanceGroupIndex',
  components: {
    InstanceGroupList,
  },
  data () {
    return {
      listId: 'InstanceGroupList',
      cloudEnvOptions: [
        { key: '', label: '全部' },
        { key: 'onpremise', label: this.$t('cloud_env.onpremise') },
      ],
      cloudEnv: '',
    }
  },
}
</script>
