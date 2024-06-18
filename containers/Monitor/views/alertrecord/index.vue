<template>
  <div>
    <page-header :title="$t('dictionary.alertrecord')" />
    <page-body>
      <list listId="AlertrecordList" :resType="resType" />
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
    return {
      resType,
    }
  },
}
</script>
