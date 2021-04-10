<template>
  <div>
    <page-header :title="$t('helm.text_3')" />
    <page-body>
      <release-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ReleaseList from './components/List'

export default {
  name: 'VmReleaseIndex',
  components: {
    ReleaseList,
  },
  data () {
    return {
      listId: 'VmReleaseList',
    }
  },
}
</script>
