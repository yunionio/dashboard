<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
export default {
  name: 'SchedtagDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'schedtag',
          title: '偏好',
        },
        {
          field: 'resource_type',
          title: '资源类型',
        },
        {
          field: 'host_count',
          title: '关联资源数量',
        },
        {
          field: 'dynamic_schedtag_count',
          title: '关联动态调度标签',
        },
        {
          field: 'schedpolicy_count',
          title: '关联调度策略',
        },
      ],
    }
  },
}
</script>
