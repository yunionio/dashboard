<template>
  <div>
    <page-header title="硬盘" />
    <page-body>
      <disk-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import DiskList from './components/List'

export default {
  name: 'DiskIndex',
  components: {
    DiskList,
  },
  data () {
    return {
      listId: 'DiskList',
    }
  },
}
</script>
