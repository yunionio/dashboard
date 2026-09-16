<template>
  <div>
    <page-header :title="$t('dictionary.container_image')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'ContainerImageIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'ContainerImageList',
    }
  },
}
</script>
