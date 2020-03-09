export const getBindingDiskCountColumn = () => {
  return {
    filed: 'binding_disk_count',
    title: '关联硬盘数量',
    width: 120,
    formatter: ({ row }) => {
      return `${row.binding_disk_count}`
    },
  }
}
