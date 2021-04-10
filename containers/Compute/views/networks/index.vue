<template>
  <div>
    <page-header :title="$t('compute.text_104')" />
    <page-body>
      <list :getParams="getParams" :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'NetworkIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'NetworkList',
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
