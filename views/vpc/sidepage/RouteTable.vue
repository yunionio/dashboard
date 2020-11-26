<template>
  <route-table-list
    :default-hidden-columns="['public_scope']"
    :hidden-columns="['brand', 'region', 'account', 'vpc']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import RouteTableList from '@Network/views/route-table/components/List'

export default {
  name: 'RouteTableListForVpcSidepage',
  components: {
    RouteTableList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
