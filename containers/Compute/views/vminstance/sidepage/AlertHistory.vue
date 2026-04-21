<template>
  <alert-resource-list
    :id="id"
    :list-id="id"
    :get-params="mergedGetParams"
    :hidden-columns="hiddenColumns" />
</template>

<script>
import AlertResourceList from '@Monitor/views/alertresource/components/List'

export default {
  name: 'VmInstanceAlertHistory',
  components: {
    AlertResourceList,
  },
  props: {
    id: String,
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  computed: {
    vmName () {
      return this.data?.name || ''
    },
    mergedGetParams () {
      return () => {
        const base = typeof this.getParams === 'function' ? this.getParams() : this.getParams
        const filter = [
          'res_type.equals("guest")',
        ]
        if (this.vmName) {
          filter.push(`res_name.equals("${this.vmName}")`)
        }
        return {
          ...(base || {}),
          filter,
        }
      }
    },
    hiddenColumns () {
      return ['res_type', 'res_name', 'ip', 'description']
    },
  },
}
</script>
