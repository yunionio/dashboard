<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="containerImage"
    resource="container_images" />
</template>

<script>
import {
  getImageNameTableColumn,
  getImageLabelTableColumn,
  getRegistryTableColumn,
  getCredentialTableColumn,
} from '../utils/columns'

export default {
  name: 'ContainerImageDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getImageNameTableColumn(),
        getImageLabelTableColumn(),
        getRegistryTableColumn({ vm: this }),
        getCredentialTableColumn(),
      ],
    }
  },
}
</script>
