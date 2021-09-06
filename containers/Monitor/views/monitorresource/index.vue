<template>
  <div>
    <page-header :title="title" />
    <page-body>
      <list listId="MonitorresourcesList" :res_type="res_type" :key="res_type" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'MonitorresourcesIndex',
  components: {
    List,
  },
  props: {
    res_type: String,
  },
  computed: {
    title () {
      return this.res_type === 'guest' ? this.$t('common.server') : this.$t('dictionary.host')
    },
  },
}
</script>
