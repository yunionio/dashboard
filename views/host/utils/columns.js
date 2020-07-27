import i18n from '@/locales'
export const getIsolatedDeviceCountColumns = () => {
  return {
    field: 'isolated_device_count',
    title: i18n.t('compute.text_609'),
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return row.isolated_device_count || '-'
    },
  }
}
