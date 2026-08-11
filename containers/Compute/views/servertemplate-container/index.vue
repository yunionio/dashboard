<template>
  <div>
    <page-header :title="$t('compute.servertemplate_container')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <servertemplate-container-list :cloud-env="cloudEnv" :cloudEnvOptions="cloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import ServertemplateContainerList from './components/List'
export default {
  name: 'ServertemplateContainerIndex',
  components: {
    ServertemplateContainerList,
  },
  data () {
    return {
      cloudEnv: '',
    }
  },
  computed: {
    cloudEnvOptions () {
      return [
        { key: 'onpremise', label: this.$t('dictionary.onpremise_env') },
      ]
    },
  },
}
</script>
