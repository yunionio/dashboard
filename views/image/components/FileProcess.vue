<template>
  <span class="error-color">{{ process }}</span>
</template>

<script>
import { sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'FileProcess',
  props: {
    size: {
      type: [String, Number],
      required: true,
    },
  },
  data () {
    return {}
  },
  computed: {
    process () {
      let size = sizestrWithUnit(this.size, 'B', 1024)
      if (!parseInt(size)) {
        size = '0 MB'
      }
      return this.$t('compute.text_639', [size])
    },
  },
}
</script>
