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
        field: 'status',
        title: '状态',
        width: 200,
        slots: {
          default: ({ row }, h) => {
            const ret = [<span style={{ color: row.status === 'Active' ? '#67C23A' : '#F56C6C' }}>{ row.status }</span>]
            return ret
          },
        },
      },
      {
        field: 'creationTimestamp',
        title: '创建于',
        minWidth: 70,
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).fromNow()
        },
      },
    ]
  },
}
