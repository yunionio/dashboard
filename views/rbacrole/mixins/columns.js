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
        width: 100,
      },
      {
        field: 'creationTimestamp',
        title: '创建于',
        minWidth: 70,
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).fromNow()
        },
      },
      {
        field: 'type',
        title: '类型',
        width: 150,
      },
    ]
  },
}
