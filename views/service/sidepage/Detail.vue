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
  name: 'K8sServiceDetail',
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
        k8sStatusColumn(),
        {
          field: 'cluster',
          title: this.$t('k8s.text_19'),
        },
        {
          field: 'namespace',
          title: this.$t('k8s.text_23'),
        },

        {
          field: 'type',
          title: this.$t('k8s.text_34'),
        },
        {
          field: 'clusterIP',
          title: 'clusterIP',
        },
        {
          field: 'sessionAffinity',
          title: this.$t('k8s.text_344'),
        },
        {
          field: 'internalEndpoint',
          title: this.$t('k8s.text_342'),
          minWidth: 200,
          slots: {
            default: ({ row }) => {
              if (row.internalEndpoint && row.internalEndpoint.ports && row.internalEndpoint.ports.length) {
                return row.internalEndpoint.ports.map(v => {
                  return <div>{ `${row.internalEndpoint.host}:${v.port} ${v.protocol}` }</div>
                })
              }
              return '-'
            },
          },
        },
        {
          field: 'externalEndpoints',
          title: this.$t('k8s.text_343'),
          slots: {
            default: ({ row }) => {
              if (row.externalEndpoints && row.externalEndpoints.length) {
                return row.externalEndpoints.map(v => {
                  return <div>{ v.host }</div>
                })
              }
              return '-'
            },
          },
        },
        {
          field: 'type',
          title: this.$t('k8s.text_34'),
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
