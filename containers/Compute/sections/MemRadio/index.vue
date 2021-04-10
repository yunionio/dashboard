<template>
  <a-form-item :extra="extra">
    <a-radio-group v-decorator="decorator" :disabled="disabled">
      <a-radio-button v-for="item in options" :value="item" :key="item" :disabled="disableOptionHandle(item)">{{ item | format }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import { sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'MemRadio',
  filters: {
    format (val) {
      return sizestrWithUnit(val, 'M', 1024)
    },
  },
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    disableOptions: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    extra: {
      type: String,
      default: '',
    },
  },
  methods: {
    disableOptionHandle (item) {
      return this.disableOptions.includes(item)
    },
  },
}
</script>
