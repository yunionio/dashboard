import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'namespace',
        title: '命名空间',
      },
      {
        field: 'clusterIP',
        title: 'clusterIP',
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
        title: '创建于',
        width: 80,
        formatter: ({ row }) => {
          return this.$moment(row.creationTimestamp).fromNow()
        },
      },
    ]
  },
}
