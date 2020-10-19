<template>
  <div>
    <page-header :title="$t('monitor.text_17')" />
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
