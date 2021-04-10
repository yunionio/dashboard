<template>
  <v-p-c-list :getParams="getParams" :showGroupActions="false" id="VpcListForCloudregionSidePage" />
</template>

<script>
import VPCList from '@Network/views/vpc/components/List'

export default {
  name: 'VPCListForCloudregion',
  components: {
    VPCList,
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
