<template>
  <div>
    <page-header :title="$t('compute.text_693')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <image-recovery-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import ImageRecoveryList from './components/List'

export default {
  name: 'ImageRecoveryIndex',
  components: {
    ImageRecoveryList,
  },
  data () {
    return {
      listId: 'ImageRecoveryList',
      cloudEnvOptions: [{ key: 'images', label: this.$t('compute.text_97') }, { key: 'guestimages', label: this.$t('compute.text_98') }],
      cloudEnv: 'images',
    }
  },
}
</script>
