<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="handleMachineChange">
      <a-radio-button value="pc">PC</a-radio-button>
      <a-radio-button value="q35">Q35</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'Machine',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleMachineChange (e) {
      this.$emit('change', { value: e.target.value })
    },
  },
}
</script>
