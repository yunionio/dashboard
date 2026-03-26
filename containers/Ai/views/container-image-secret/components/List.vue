<template>
  <list id="ContainerImageSecretList" type="container_image" :get-params="getParams" />
</template>

<script>
import List from '../../container-secret/components/List.vue'

export default {
  name: 'ContainerImageSecretList',
  components: {
    List,
  },
  props: {
    getParams: {
      type: Object,
    },
  },
}
</script>
