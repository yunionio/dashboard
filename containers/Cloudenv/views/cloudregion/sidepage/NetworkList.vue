<template>
  <network-list
    :getParams="getParams"
    :hidden-actions="['create']"
    :hidden-columns="['brand', 'region']"
    :hidden-filter-options="['brand', 'region', 'cloudaccount']"
    id="NetworkListForCloudregionSidePage" />
</template>

<script>
import NetworkList from '@Network/views/network/components/List'

export default {
  name: 'NetworkListForCloudregion',
  components: {
    NetworkList,
  },
  props: {
    resId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      getParams: {
        cloudregion_id: this.resId,
      },
    }
  },
}
</script>
