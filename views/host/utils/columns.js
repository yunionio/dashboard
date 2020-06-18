export const getIsolatedDeviceCountColumns = () => {
  return {
    field: 'isolated_device_count',
    title: 'GPU卡数量',
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return row.isolated_device_count || '-'
    },
  }
}
