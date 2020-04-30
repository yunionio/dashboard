import { getNameDescriptionTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

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
        sortable: true,
      },
      {
        field: 'clusterIP',
        title: 'clusterIP',
        minWidth: 70,
        slots: {
          default: ({ row }) => {
            if (row.clusterIP === 'None') return row.clusterIP
            return [
              <list-body-cell-wrap copy row={ row } onManager={ this.onManager } field='clusterIP' title={ row.clusterIP } />,
            ]
          },
        },
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
                return <list-body-cell-wrap copy row={ v } onManager={ this.onManager } field='host' title={ v.host } />
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
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
