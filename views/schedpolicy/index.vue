<template>
  <div>
    <page-header :title="$t('cloudenv.text_19')" />
    <page-body>
      <schedpolicy-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SchedpolicyList from './components/List'

export default {
  name: 'Schedpolicy',
  components: {
    SchedpolicyList,
  },
  data () {
    return {
      listId: 'SchedpolicyList',
    }
  },
}
</script>
