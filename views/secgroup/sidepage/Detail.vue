<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="secgroups"
    :base-info="baseInfo" />
</template>

<script>
import { getPublicScopeTableColumn } from '@/utils/common/tableColumn'

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
          title: '关联虚拟机',
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'vminstance-list') }>{row.guest_cnt}</a>
          },
        },
        {
          field: 'cache_cnt',
          title: '缓存份数',
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'cache-list') }>{row.cache_cnt}</a>
          },
        },
        getPublicScopeTableColumn({ vm: this, resource: 'secgroups' }),
      ],
    }
  },
}
</script>
