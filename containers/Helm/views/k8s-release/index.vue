<template>
  <div>
    <page-header :title="$t('helm.text_4')" />
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
