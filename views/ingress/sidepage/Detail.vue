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
  name: 'K8sIngressDetail',
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
          field: 'endpoints',
          title: this.$t('k8s.text_240'),
          slots: {
            default: ({ row }) => {
              if (!row.endpoints) return '-'
              return row.endpoints.filter(v => v.host).map(v => {
                let value = '-'
                if (v.host && v.ports) value = `${v.host}:${v.ports}`
                if (v.host && !v.ports) value = v.host
                return <a-tag>{ value }</a-tag>
              })
            },
          },
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
