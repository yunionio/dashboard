<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="inter_vpc_networks"
    statusModule="vpcNetwork"
    :hiddenKeys="['tenant', 'project_domain', 'region', 'zone']" />
</template>

<script>
import {
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VpcNetworkDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'inter_vpc_networks', columns: () => this.columns, tipName: this.$t('dictionary.vpc_network') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'inter_vpc_networks', columns: () => this.columns, tipName: this.$t('dictionary.vpc_network') }),
        {
          field: 'project',
          title: this.$t('common.attribution_scope'),
          slots: {
            default: ({ row }, h) => {
              const ret = []
              const domain = row.project_domain || row.domain
              if (domain) {
                ret.push(
                  <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
                    <span>{ domain }</span>
                  </list-body-cell-wrap>,
                )
              }
              return ret
            },
          },
        },
        getBrandTableColumn(),
      ],
      extraInfo: [],
    }
  },
}
</script>
