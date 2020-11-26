<template>
  <disk-list
    :hiddenFilterOptions="['storage', 'region']"
    :id="id"
    :getParams="getParams"
    :show-create-action="false" />
</template>

<script>
import DiskList from '@Compute/views/disk/components/List'

export default {
  name: 'DiskListForBlockstorageSidepage',
  components: {
    DiskList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
