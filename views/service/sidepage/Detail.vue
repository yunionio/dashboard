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
          title: '名称',
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
        {
          field: 'cluster',
          title: '集群',
        },
        {
          field: 'namespace',
          title: '命名空间',
        },

        {
          field: 'type',
          title: '类型',
        },
        {
          field: 'clusterIP',
          title: 'clusterIP',
        },
        {
          field: 'sessionAffinity',
          title: '会话保持',
        },
        {
          field: 'internalEndpoint',
          title: '内部接入端',
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
          title: '外部接入端',
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
          title: '类型',
        },
        {
          field: 'creationTimestamp',
          title: '创建时间',
          formatter: ({ row }) => {
            return (row.creationTimestamp && this.$moment(row.creationTimestamp).format()) || '-'
          },
        },
      ],
    }
  },
}
</script>
