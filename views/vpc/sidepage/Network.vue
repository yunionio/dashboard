<template>
  <network-list
    :hidden-actions="['create']"
    :hidden-columns="['brand', 'region', 'account', 'tenant']"
    :hidden-filter-options="['vpc']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import NetworkList from '@Network/views/network/components/List'

export default {
  name: 'NetworkListForVpcSidepage',
  components: {
    NetworkList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
