<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="handleVdiChange">
      <a-radio-button value="vnc">VNC</a-radio-button>
      <a-radio-button value="spice">SPICE</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'VDI',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleVdiChange (e) {
      this.$emit('change', { value: e.target.value })
    },
  },
}
</script>
