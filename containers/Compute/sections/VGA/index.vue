<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator">
      <a-radio-button :value="opt.value" v-for="opt in vgaOptions" :key="opt.value">{{ opt.text }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'VGA',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    vdi: {
      type: String,
    },
  },
  computed: {
    vgaOptions () {
      var options = []
      if (this.vdi === 'vnc') {
        options.push({
          text: 'Standard',
          value: 'std',
        })
      }
      options.push(
        {
          text: 'QXL',
          value: 'qxl',
        },
        /* {
          text: 'Virtio-VGA',
          value: 'virtio',
        }, */
      )
      return options
    },
  },
}
</script>
