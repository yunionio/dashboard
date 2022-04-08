<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator" @change="handleMachineChange">
      <a-radio-button :value="opt.value" v-for="opt in machineOptions" :key="opt.value">{{ opt.text }}</a-radio-button>
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
    isArm: {
      type: Boolean,
      required: true,
    },
    showDefault: {
      type: Boolean,
    },
  },
  computed: {
    machineOptions () {
      var options = []
      if (this.showDefault) {
        options.push({
          text: this.$t('compute.text_1'),
          value: '',
        })
      }
      if (this.isArm) {
        options.push(
          {
            text: 'VIRT',
            value: 'virt',
          },
        )
      } else {
        options.push(
          {
            text: 'PC',
            value: 'pc',
          },
          {
            text: 'Q35',
            value: 'q35',
          },
        )
      }
      return options
    },
  },
  methods: {
    handleMachineChange (e) {
      this.$emit('change', { value: e.target.value })
    },
  },
}
</script>
