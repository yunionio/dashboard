<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="secgroups"
    :base-info="baseInfo" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { getPublicScopeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SecgroupDetail',
  mixins: [WindowsMixin],
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
        none: this.$t('compute.text_1029'),
        domain: this.$t('shareScope.domain'),
      },
      baseInfo: [
        getPublicScopeTableColumn({ vm: this, resource: 'secgroups' }),
        {
          field: 'guest_cnt',
          title: this.$t('compute.text_1023'),
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'vminstance-list') }>{row.guest_cnt}</a>
          },
        },
        {
          field: 'cache_cnt',
          title: this.$t('compute.text_1030'),
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'cache-list') }>{row.cache_cnt}</a>
          },
        },
      ],
    }
  },
}
</script>
