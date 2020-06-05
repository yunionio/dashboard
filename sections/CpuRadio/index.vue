<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="change" :disabled="disabled">
      <a-radio-button v-for="item in options" :value="item" :key="item" :disabled="disableOptionHandle(item)">{{ item }}核</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'CpuRadio',
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
  },
  methods: {
    change (e) {
      this.$emit('change', e.target.value)
    },
    disableOptionHandle (item) {
      return this.disableOptions.includes(item)
    },
  },
}
</script>
