<template>
  <a class="open-dialog-link" href="javascript:;" @click="clickHandle">{{ name }}</a>
</template>

<script>
export default {
  name: 'DialogTrigger',
  props: {
    vm: {
      type: Object,
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
    },
    columns: {
      type: Array,
    },
    resource: {
      type: String,
    },
    apiVersion: {
      type: String,
      default: 'v2',
    },
    onManager: {
      type: Object,
    },
    extParams: {
      type: Object,
    },
  },
  methods: {
    clickHandle () {
      this.openDialog()
    },
    openDialog () {
      const manager = this.resource ? new this.$Manager(this.resource, this.apiVersion) : this.onManager
      this.vm.createDialog(this.value, {
        data: this.data,
        columns: this.columns,
        onManager: manager,
        extParams: this.extParams,
        success: () => {
          this.$emit('success')
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import "~@/styles/less/theme";

.open-dialog-link {
  color: @link-color;
}
</style>
