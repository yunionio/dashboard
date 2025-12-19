<template>
  <div>
    <page-header :title="$t('aice.llm_image')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'LlmImageIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'LlmImageList',
    }
  },
}
</script>
