<template>
  <div>
    <page-header title="弹性公网IP" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <eip-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import EipList from './components/List'

export default {
  name: 'EipIndex',
  components: {
    EipList,
  },
  data () {
    return {
      listId: 'EipList',
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
