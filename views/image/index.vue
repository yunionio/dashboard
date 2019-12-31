<template>
  <div>
    <page-header title="系统镜像" />
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
