<template>
  <disk-snapshot-list
    :hiddenFilterOptions="['storage', 'region']"
    :id="id"
    :getParams="getParams"
    :show-create-action="false" />
</template>

<script>
import DiskSnapshotList from '@Compute/views/snapshot/components/List'

export default {
  name: 'DiskSnapshotListForBlockstorageSidepage',
  components: {
    DiskSnapshotList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
