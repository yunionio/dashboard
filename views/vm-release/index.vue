<template>
  <div>
    <page-header title="虚拟机实例" />
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
