<template>
  <div>
    <page-header title="宿主机" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <host-list :get-params="listParams" :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import HostList from './components/List'

export default {
  name: 'HostIndex',
  components: {
    HostList,
  },
  data () {
    return {
      listId: 'HostList',
      listParams: {
        details: true,
        baremetal: false,
      },
      cloudEnvOptions: [
        { key: '', label: '全部' },
        { key: 'onpremise', label: this.$t('cloud_env.onpremise') },
        { key: 'private', label: this.$t('cloud_env.private') },
      ],
      cloudEnv: '',
    }
  },
}
</script>
