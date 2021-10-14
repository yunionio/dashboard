<template>
  <cloudaccount-list
    :hidden-actions="['create']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import CloudaccountList from '@Cloudenv/views/cloudaccount/components/List'

export default {
  name: 'CloudaccountListForDomainSidepage',
  components: {
    CloudaccountList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
