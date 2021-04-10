<template>
  <network-list
    :hidden-actions="['create']"
    :hidden-columns="['brand', 'region', 'account', 'tenant', 'vpc', 'wire']"
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
