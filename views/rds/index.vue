<template>
  <div>
    <page-header :title="$t('dictionary.dbinstance')" />
    <page-body>
      <rds-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import rdsList from './components/List'

export default {
  name: 'RDSIndex',
  components: {
    rdsList,
  },
  data () {
    return {
      listId: 'RDSList',
    }
  },
  methods: {
    createServer () {
      this.$router.push('/rds/create')
    },
  },
}
</script>
