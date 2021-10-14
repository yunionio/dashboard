<template>
  <div>
    <page-header :title="$t('dictionary.user')" />
    <a-alert :message="$t('common_611')" type="info" class="mt-2" v-if="isOperation" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'UserIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'UserList',
      isOperation: process.env.VUE_APP_PLATFORM === 'operation',
    }
  },
}
</script>
