<template>
  <a-input
    :value="hostName"
    :placeholder="$t('validator.resourceCreateName')"
    @change="handleHostNameChange" />
</template>

<script>
export default {
  name: 'HostName',
  props: ['value'],
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
