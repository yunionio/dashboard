<template>
  <div>
    <page-header :title="$t('dictionary.access_group')" />
    <page-body>
      <access-group-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import AccessGroupList from './components/List'

export default {
  name: 'AccessGroup',
  components: {
    AccessGroupList,
  },
  data () {
    return {
      listId: 'AccessGroupList',
    }
  },
}
</script>
