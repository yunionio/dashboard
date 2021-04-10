<template>
  <host-list
    :hiddenFilterOptions="['brand', 'region', 'zone', 'account']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import HostList from '@Compute/views/host/components/List'

export default {
  name: 'HostListForCloudaccountSidepage',
  components: {
    HostList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
