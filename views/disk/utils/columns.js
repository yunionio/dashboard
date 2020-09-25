import i18n from '@/locales'
export const getUnusedTableColumn = () => {
  return {
    field: 'unused',
    title: i18n.t('table.title.disk_mounted'),
    width: 70,
    slots: {
      default: ({ row }, h) => {
        return row.guest_count >= 1 ? [<span class="success-color">{ i18n.t('compute.text_464') }</span>] : [<span class="warning-color">{ i18n.t('compute.text_281') }</span>]
      },
    },
  }
}
