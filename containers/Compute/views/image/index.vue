<template>
  <div>
    <page-header :title="$t('compute.text_97')" />
    <page-body>
      <image-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ImageList from './components/List'

export default {
  name: 'ImageIndex',
  components: {
    ImageList,
  },
  data () {
    return {
      listId: 'ImageList',
    }
  },
}
</script>
