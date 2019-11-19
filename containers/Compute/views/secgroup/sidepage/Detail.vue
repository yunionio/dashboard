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
      baseInfo: [
        {
          field: 'name',
          title: '名称',
        },
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
        },
        {
          field: 'tenant',
          title: '项目',
        },
        {
          field: 'project_domain',
          title: '部门(域)',
        },
      ],
    }
  },
}
</script>
