<template>
  <div>
    <page-header :title="$t('dictionary.commonalert')" :current-tab.sync="alertType" :tabs="cloudEnvOptions" />
    <page-body>
      <commonalert-list :alertType="alertType" />
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
    return {
      cloudEnvOptions: [{ key: 'all', label: '全部' }, { key: 'normal', label: '自定义策略' }, { key: 'system', label: '默认策略' }],
      alertType: 'all',
    }
  },
}
</script>
