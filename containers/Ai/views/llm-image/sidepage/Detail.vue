<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :name-rules="nameRules"
    status-module="phoneImage"
    resource="llm_images" />
</template>

<script>
import {
  getOsArch,
} from '@/utils/common/tableColumn'
import {
  getImageNameTableColumn,
  getImageLabelTableColumn,
} from '../utils/columns'

export default {
  name: 'PhoneImageDetail',
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
        getOsArch(),
        getImageNameTableColumn(),
        getImageLabelTableColumn(),
      ],
    }
  },
}
</script>
