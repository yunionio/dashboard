<template>
  <div>
    <page-header :title="$t('aice.llm_image')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from '@Ai/views/llm-image/components/List'

export default {
  name: 'AppLlmImageIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'AppLlmImageList',
    }
  },
}
</script>
