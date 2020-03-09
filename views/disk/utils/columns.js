export const getUnusedTableColumn = () => {
  return {
    field: 'unused',
    title: '是否挂载',
    width: 70,
    slots: {
      default: ({ row }, h) => {
        return row.guest_count >= 1 ? [<span class="success-color">已挂载</span>] : [<span class="warning-color">待挂载</span>]
      },
    },
  }
}
