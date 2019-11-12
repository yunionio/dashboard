<template>
  <div>
    <page-header title="硬盘" />
    <page-body>
      <disk-list />
    </page-body>
  </div>
</template>

<script>
import DiskList from './components/List'

export default {
  name: 'SKUIndex',
  components: {
    DiskList,
  },
}
</script>
