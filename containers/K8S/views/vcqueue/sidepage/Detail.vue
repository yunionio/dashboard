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

function resourceText (cpu, memory) {
  if (!cpu && !memory) return '-'
  return `${cpu || '-'} / ${memory || '-'}`
}

export default {
  name: 'K8SVCQueueDetail',
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
        k8sStatusColumn({ statusModule: 'k8s_resource_vcqueue' }),
        {
          field: 'cluster',
          title: this.$t('k8s.text_19'),
        },
        {
          field: 'parent',
          title: this.$t('k8s.vc_parent'),
          formatter: ({ row }) => row.parent || '-',
        },
        {
          field: 'weight',
          title: this.$t('k8s.vc_weight'),
        },
        {
          field: 'priority',
          title: this.$t('k8s.vc_priority'),
        },
        {
          field: 'reclaimable',
          title: this.$t('k8s.vc_reclaimable'),
          formatter: ({ row }) => row.reclaimable ? this.$t('k8s.vc_yes') : this.$t('k8s.vc_no'),
        },
        {
          field: 'guaranteeCpu',
          title: this.$t('k8s.vc_guarantee'),
          formatter: ({ row }) => resourceText(row.guaranteeCpu, row.guaranteeMemory),
        },
        {
          field: 'deservedCpu',
          title: this.$t('k8s.vc_deserved'),
          formatter: ({ row }) => resourceText(row.deservedCpu, row.deservedMemory),
        },
        {
          field: 'capabilityCpu',
          title: this.$t('k8s.vc_capability'),
          formatter: ({ row }) => resourceText(row.capabilityCpu, row.capabilityMemory),
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
