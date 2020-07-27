import i18n from '@/locales'
export const getBindingDiskCountColumn = () => {
  return {
    filed: 'binding_disk_count',
    title: i18n.t('compute.text_1082'),
    width: 120,
    formatter: ({ row }) => {
      return `${row.binding_disk_count}`
    },
  }
}
