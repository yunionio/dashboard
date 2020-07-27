import i18n from '@/locales'
export const getMaintenanceTableColumn = () => {
  return {
    field: 'is_maintenance',
    title: i18n.t('compute.text_820'),
    width: 70,
    formatter: ({ row }) => {
      return row.is_maintenance ? i18n.t('compute.text_820') : i18n.t('compute.text_821')
    },
  }
}
