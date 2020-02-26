<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
export default {
  name: 'SecgroupDetail',
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      PUBLIC_SCOPE_ZH: {
        system: this.$t('shareScope.system'),
        project: this.$t('shareScope.project'),
        none: '不共享',
        domain: this.$t('shareScope.domain'),
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
