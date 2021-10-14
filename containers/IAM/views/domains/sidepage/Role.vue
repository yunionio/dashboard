<template>
  <role-list
    :hidden-actions="['create']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import RoleList from '@IAM/views/role/components/List'

export default {
  name: 'RoleListForDomainSidepage',
  components: {
    RoleList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
