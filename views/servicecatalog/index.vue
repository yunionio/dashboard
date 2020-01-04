<template>
  <div>
    <page-header title="服务目录" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <servicecatalog-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import ServicecatalogList from './components/List'

export default {
  name: 'ServertemplateIndex',
  components: {
    ServicecatalogList,
  },
  data () {
    return {
      listId: 'ServicecatalogList',
      cloudEnvOptions: [
        { key: '', label: '全部' },
        { key: 'onpremise', label: this.$t('cloud_env.onpremise') },
      ],
      cloudEnv: '',
    }
  },
}
</script>
