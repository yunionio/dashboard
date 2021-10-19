<template>
  <div>
    <page-header :title="$t('dictionary.role')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'RoleIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'RoleList',
    }
  },
}
</script>
