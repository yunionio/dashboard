export const getMaintenanceTableColumn = () => {
  return {
    field: 'is_maintenance',
    title: '维护模式',
    width: 70,
    formatter: ({ row }) => {
      return row.is_maintenance ? '维护模式' : '正常'
    },
  }
}
