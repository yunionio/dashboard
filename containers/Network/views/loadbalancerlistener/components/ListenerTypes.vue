<template>
  <a-form-item>
    <a-radio-group :disabled="disabled" v-decorator="decorators.listener_type">
      <a-radio-button v-for="item in listenerTypeOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'LbListenerType',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.listener_type,
    },
    listenerTypeOpts: {
      type: Array,
      default: () => [
        { label: 'TCP', key: 'tcp' },
        { label: 'UDP', key: 'udp' },
        { label: 'HTTP', key: 'http' },
        { label: 'HTTPS', key: 'https' },
      ],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
