<template>
  <div>
    <page-header title="密钥" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <key-pair-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import KeyPairList from './components/List'

export default {
  name: 'KeyPairIndex',
  components: {
    KeyPairList,
  },
  data () {
    return {
      listId: 'KeyPairList',
      cloudEnvOptions: [
        { key: '', label: '全部' },
        { key: 'onpremise', label: this.$t('cloud_env.onpremise') },
      ],
      cloudEnv: '',
    }
  },
}
</script>
