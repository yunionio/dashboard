<template>
  <network-list :getParams="getParams" :showGroupActions="false" />
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
