<template>
  <alert-resource-list
    :id="id"
    :list-id="id"
    :get-params="mergedGetParams"
    :hidden-columns="hiddenColumns"
    default-time="" />
</template>

<script>
import AlertResourceList from '@Monitor/views/alertresource/components/List'

export default {
  name: 'HostAlertHistory',
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
    hostId () {
      return this.data?.id || ''
    },
    mergedGetParams () {
      return () => {
        const base = typeof this.getParams === 'function' ? this.getParams() : this.getParams
        const params = {
          ...(base || {}),
          all_state: true,
          alerting: true,
        }
        if (this.hostId) {
          params.monitor_resource_id = this.hostId
        }
        return params
      }
    },
    hiddenColumns () {
      // 宿主机详情内已固定资源类型/资源名称，不需要展示这些过滤项
      return ['res_type', 'res_name', 'ip', 'description']
    },
  },
}
</script>
