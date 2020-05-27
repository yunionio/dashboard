<template>
  <div>
    <page-header title="发布(Release)" />
    <page-body>
      <release-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ReleaseList from './components/List'

export default {
  name: 'K8sReleaseIndex',
  components: {
    ReleaseList,
  },
  data () {
    return {
      listId: 'K8sReleaseList',
    }
  },
}
</script>
