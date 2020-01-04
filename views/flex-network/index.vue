<template>
  <div>
    <page-header title="弹性网卡" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <flex-network-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import FlexNetworkList from './components/List'

export default {
  name: 'FlexNetworkIndex',
  components: {
    FlexNetworkList,
  },
  data () {
    return {
      listId: 'FlexNetworkList',
      cloudEnvOptions: [
        { key: '', label: '全部' },
        { key: 'private', label: this.$t('cloud_env.private') },
        { key: 'public', label: this.$t('cloud_env.public') },
      ],
      cloudEnv: '',
    }
  },
}
</script>
