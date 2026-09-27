<template>
  <block-storage-list
    :id="id"
    :getParams="getParams"
    :cloudEnv="cloudEnv"
    :hidenGroupActions="true" />
</template>

<script>
import BlockStorageList from '@Storage/views/blockstorage/components/List'

export default {
  name: 'StorageListForHostSidepage',
  components: {
    BlockStorageList,
  },
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
  },
}
</script>
