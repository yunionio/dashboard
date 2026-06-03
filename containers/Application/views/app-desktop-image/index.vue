<template>
  <div>
    <page-header :title="$t('aice.desktop_llm_image')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from '@Ai/views/llm-image/components/List'

export default {
  name: 'AppDesktopImageIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'AppDesktopImageList',
    }
  },
}
</script>
