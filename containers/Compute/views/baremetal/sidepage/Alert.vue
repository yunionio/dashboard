<template>
  <node-alert-list :get-params="params" :data="data" alertType="guest" />
</template>

<script>
import NodeAlertList from '@Compute/views/node-alert/components/List'

export default {
  name: 'BaremetalAlertListSidepage',
  components: {
    NodeAlertList,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      params: {
        details: true,
        type: 'guest',
        node_id: this.data.id,
        scope: this.$store.getters.scope,
      },
    }
  },
}
</script>
