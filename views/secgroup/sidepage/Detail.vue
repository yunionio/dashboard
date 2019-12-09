<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
export default {
  name: 'SecgroupDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      PUBLIC_SCOPE_ZH: {
        system: '系统',
        project: '项目',
        none: '不共享',
        domain: '域',
      },
      baseInfo: [
        {
          field: 'guest_cnt',
          title: '关联实例',
        },
        {
          field: 'cache_cnt',
          title: '缓存份数',
        },
        {
          field: 'public_scope',
          title: '共享范围',
          formatter: ({ cellValue }) => {
            return this.PUBLIC_SCOPE_ZH[cellValue]
          },
        },
      ],
    }
  },
}
</script>
