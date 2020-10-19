<template>
  <div>
    <page-header title="报警资源" />
    <page-body>
      <list listId="AlertresourceList" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AlertresourceIndex',
  components: {
    List,
  },
}
</script>
