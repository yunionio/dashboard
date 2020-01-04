<template>
  <div>
    <page-header title="二层网络" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <wire-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import WireList from './components/List'

export default {
  name: 'WireIndex',
  components: {
    WireList,
  },
  data () {
    return {
      listId: 'WireList',
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
