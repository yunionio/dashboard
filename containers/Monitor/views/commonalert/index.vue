<template>
  <div>
    <page-header :title="$t('dictionary.commonalert')" :current-tab.sync="alertType" :tabs="cloudEnvOptions" />
    <page-body>
      <commonalert-list :alertType="alertType" listId="CommonalertList" />
    </page-body>
  </div>
</template>

<script>
import CommonalertList from './components/List'

export default {
  name: 'Monitor',
  components: {
    CommonalertList,
  },
  data () {
    let cloudEnvOptions = [{ key: 'all', label: this.$t('monitor.text_3') }, { key: 'normal', label: this.$t('monitor.text_4') }, { key: 'system', label: this.$t('monitor.text_5') }]
    if (!this.$store.getters.isAdminMode) {
      cloudEnvOptions = [{ key: 'normal', label: this.$t('monitor.text_4') }]
    }
    const alertType = cloudEnvOptions[0].key
    return {
      cloudEnvOptions,
      alertType,
    }
  },
}
</script>
