<template>
  <div>
    <page-header :title="$t('compute.text_233')" />
    <page-body>
      <list :getParams="getParams" :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AnsiblePlaybookIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'AnsiblePlaybookList',
    }
  },
  methods: {
    getParams () {
      return {
        details: true,
      }
    },
  },
}
</script>
