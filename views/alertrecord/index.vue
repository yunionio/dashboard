<template>
  <div>
    <page-header :title="$t('dictionary.alertrecord')" :current-tab.sync="alertType" :tabs="cloudEnvOptions" />
    <page-body>
      <list listId="AlertrecordList" :alertType="alertType" :resType="resType" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AlertrecordIndex',
  components: {
    List,
  },
  data () {
    let resType = ''
    if (this.$route.query.res_type) {
      resType = this.$route.query.res_type
    }
    const cloudEnvOptions = [{ key: 'un-recovered', label: this.$t('monitor.overview_alert_sum') }, { key: 'all', label: this.$t('monitor.text_19') }]
    const alertType = cloudEnvOptions[0].key
    return {
      cloudEnvOptions,
      alertType,
      resType,
    }
  },
}
</script>
