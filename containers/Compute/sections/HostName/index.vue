<template>
  <a-input
    :value="hostName"
    :placeholder="isWindows ? $t('compute.validate.windows') : $t('compute.validate.others')"
    @change="handleHostNameChange" />
</template>

<script>
export default {
  name: 'HostName',
  props: ['value', 'isWindows'],
  data () {
    return {
      hostName: this.value,
    }
  },
  watch: {
    value (val) {
      this.hostName = val
    },
  },
  methods: {
    handleHostNameChange (e) {
      this.$emit('change', e)
    },
  },
}
</script>
