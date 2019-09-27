<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="change">
      <a-radio-button v-for="item in options" :value="item" :key="item">{{ item }}核</a-radio-button>
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
  },
  methods: {
    change (e) {
      this.$emit('change', e.target.value)
    },
  },
}
</script>
