import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        editDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'mode',
        title: '集群类型',
        minWidth: 80,
        formatter: ({ cellValue }) => {
          switch (cellValue) {
            case 'customize':
              return '自建'
            case 'import':
              return '导入'
            default:
              return '-'
          }
        },
      },
      {
        field: 'resource_type',
        title: '资源类型',
        width: 70,
        formatter: ({ cellValue }) => {
          switch (cellValue) {
            case 'guest':
              return '云服务器'
            case 'host':
              return '宿主机'
            default:
              return '-'
          }
        },
      },
      {
        field: 'version',
        title: '版本',
        width: 100,
        slots: {
          default: ({ row }, h) => {
            return [
              <a-tag color="blue">{ row.version }</a-tag>,
            ]
          },
        },
      },
      {
        field: 'machines',
        title: '节点数量',
        width: 70,
      },
      {
        field: 'is_public',
        title: '是否公有',
        width: 70,
        formatter: ({ cellValue }) => {
          return cellValue ? '公有' : '私有'
        },
      },
      getStatusTableColumn({ statusModule: 'kubecluster' }),
      getProjectTableColumn(),
    ]
  },
}
