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
    form: {
      type: Object,
    },
    showDefault: {
      type: Boolean,
    },
  },
  computed: {
    vgaOptions () {
      var options = []
      if (this.showDefault) {
        options.push({
          text: this.$t('compute.text_1'),
          value: '',
        })
      }
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
  watch: {
    vdi: {
      handler: function (val) {
        const vga = this.form.fc.getFieldValue('vga')
        if (!this.vgaOptions.some(item => item.value === vga)) {
          this.form.fc.setFieldsValue({ vga: this.vgaOptions[0].value })
        }
      },
    },
  },
}
</script>
