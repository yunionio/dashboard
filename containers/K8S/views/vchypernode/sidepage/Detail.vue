<template>
  <detail
    :showDesc="false"
    :showName="false"
    :hiddenKeys="['project_domain', 'tenant', 'created_at', 'updated_at']"
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { k8sStatusColumn } from '@K8S/utils/tableColumns'

export default {
  name: 'K8SVCHyperNodeDetail',
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
          field: 'name',
          title: this.$t('k8s.text_41'),
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ this.data } onManager={ this.onManager } field='name' title={ row.name } />
                </div>,
              ]
            },
          },
        },
        k8sStatusColumn({ statusModule: 'k8s_resource_vchypernode' }),
        {
          field: 'cluster',
          title: this.$t('k8s.text_19'),
        },
        {
          field: 'tier',
          title: this.$t('k8s.vc_tier'),
        },
        {
          field: 'tierName',
          title: this.$t('k8s.vc_tier_name'),
          formatter: ({ row }) => row.tierName || '-',
        },
        {
          field: 'nodeCount',
          title: this.$t('k8s.vc_node_count'),
        },
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ row }) => {
            return (row.creationTimestamp && this.$moment(row.creationTimestamp).format()) || '-'
          },
        },
      ],
    }
  },
}
</script>
