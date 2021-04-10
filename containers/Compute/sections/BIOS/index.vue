<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator">
      <a-tooltip :title="$t('compute.text_1362')" v-if="isArm">
        <a-radio-button value="BIOS" :disabled="isArm">BIOS</a-radio-button>
      </a-tooltip>
      <a-radio-button v-else value="BIOS" :disabled="uefi">BIOS</a-radio-button>
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
    uefi: {
      type: Boolean,
    },
    isArm: {
      type: Boolean,
    },
  },
}
</script>
