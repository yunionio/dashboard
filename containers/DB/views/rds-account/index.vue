<template>
  <div>
    <page-header :title="$t('db.text_188')" />
    <page-body>
      <rds-list />
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
  methods: {
    createServer () {
      this.$router.push('/rds/create')
    },
  },
}
</script>
