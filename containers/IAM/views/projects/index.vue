<template>
  <div>
   <page-header :title="$t('dictionary.project')" />
   <page-body>
     <list :id="listId" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'ProjectsIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'ProjectList',
    }
  },
}
</script>
