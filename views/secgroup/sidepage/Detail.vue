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
      ],
    }
  },
}
</script>
