<template>
  <div>
    <page-header :title="$t('cloudenv.text_16')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <tag-list :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import TagList from './components/List'

export default {
  name: 'TagIndex',
  components: {
    TagList,
  },
  data () {
    return {
      cloudEnv: 'local_compute',
      cloudEnvOptions: [
        { key: 'local_compute', label: this.$t('cloudenv.text_470') },
        { key: 'local_image', label: this.$t('cloudenv.text_471') },
        { key: 'local_identity', label: this.$t('cloudenv.tab_identity') },
        // { key: 'cloud', label: this.$t('cloudenv.text_472') },
      ],
    }
  },
}
</script>
