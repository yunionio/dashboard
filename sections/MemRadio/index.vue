<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator">
      <a-radio-button v-for="item in options" :value="item" :key="item" :disabled="disableOptionHandle(item)">{{ item | format }}GB</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'MemRadio',
  filters: {
    format (val) {
      if (val >= 1024) return val / 1024
      return val
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
  },
  methods: {
    disableOptionHandle (item) {
      return this.disableOptions.includes(item)
    },
  },
}
</script>
