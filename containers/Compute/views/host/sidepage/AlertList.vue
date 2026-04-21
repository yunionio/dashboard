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
  name: 'HostAlertList',
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
    hostName () {
      return this.data?.name || ''
    },
    mergedGetParams () {
      return () => {
        const base = typeof this.getParams === 'function' ? this.getParams() : this.getParams
        const filter = [
          'res_type.equals("host")',
        ]
        if (this.hostName) {
          filter.push(`res_name.equals("${this.hostName}")`)
        }
        return {
          ...(base || {}),
          filter,
        }
      }
    },
    hiddenColumns () {
      // 宿主机详情内已固定资源类型/资源名称，不需要展示这些过滤项
      return ['res_type', 'res_name', 'ip', 'description']
    },
  },
}
</script>
