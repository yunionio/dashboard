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
    },
  },
  data () {
    return {}
  },
  computed: {
    process () {
      const size = sizestrWithUnit(this.size, 'B', 1024)
      return ` (已上传${size})`
    },
  },
}
</script>
