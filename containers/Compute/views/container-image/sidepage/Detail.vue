<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :name-rules="nameRules"
    status-module="containerImage"
    resource="container_images" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getImageNameTableColumn,
  getImageLabelTableColumn,
  getRegistryTableColumn,
  getCredentialTableColumn,
  getCommandTableColumn,
  getArgsTableColumn,
  getEnvsTableColumn,
} from '../utils/columns'

export default {
  name: 'ContainerImageDetail',
  mixins: [WindowsMixin],
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
      nameRules: [
        { required: true, message: this.$t('compute.text_210') },
        { validator: this.$validate('imageName') },
      ],
      baseInfo: [
        getImageNameTableColumn(),
        getImageLabelTableColumn(),
        getRegistryTableColumn({ vm: this }),
        getCredentialTableColumn(),
        getCommandTableColumn(),
        getArgsTableColumn(),
        getEnvsTableColumn(),
      ],
    }
  },
}
</script>
