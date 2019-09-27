<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator">
      <a-radio-button value="BIOS">BIOS</a-radio-button>
      <a-radio-button value="UEFI">UEFI</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'BIOS',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
}
</script>
