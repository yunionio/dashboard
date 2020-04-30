import { getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      {
        field: 'name',
        title: '名称',
        width: 300,
        slots: {
          default: ({ row }, h) => {
            const ret = [<side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>]
            return ret
          },
        },
      },
      {
        field: 'namespace',
        title: '命名空间',
        width: 200,
        sortable: true,
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
