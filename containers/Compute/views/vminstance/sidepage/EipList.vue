<template>
  <eip-list
    :hiddenColumns="['associate_name', 'account']"
    :id="id"
    :showSearchbox="false"
    :getParams="getParams"
    :show-create-action="false" />
</template>

<script>
import EipList from '@Network/views/eip/components/List'

export default {
  name: 'EipListForVminstanceSidepage',
  components: {
    EipList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
