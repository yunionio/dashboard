<template>
  <div>
    <page-header :title="$t('cloudenv.bill_tasks')" />
    <page-body>
      <billtask-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import BilltaskList from './components/List'

export default {
  name: 'ProjectSharingIndex',
  components: {
    BilltaskList,
  },
  data () {
    return {
      listId: 'BilltaskList',
    }
  },
  computed: {
    getParams () {
      return {}
    },
  },
}
</script>
