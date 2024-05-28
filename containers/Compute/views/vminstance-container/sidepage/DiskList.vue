<template>
  <disk-list
    :hiddenColumns="['unused', 'guest', 'medium_type', 'account']"
    :hiddenFilterOptions="['guest_id', 'unused', 'brand', 'region', 'account']"
    :id="id"
    :getParams="getParams"
    :show-create-action="false" />
</template>

<script>
import DiskList from '@Compute/views/disk/components/List'

export default {
  name: 'DiskListForVmContainerInstanceSidePage',
  components: {
    DiskList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
