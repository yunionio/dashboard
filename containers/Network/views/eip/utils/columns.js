import i18n from '@/locales'
export const getAssociateNameTableColumn = (vm) => {
  return {
    field: 'associate_name',
    title: i18n.t('network.text_197'),
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const type = {
          server: i18n.t('network.text_226'),
          natgateway: i18n.t('network.text_227'),
          loadbalancer: i18n.t('network.text_137'),
        }
        if (!row.associate_name) return '-'
        const text = `${row.associate_name}(${type[row.associate_type] || '-'})`
        if (vm) {
          return [
            <list-body-cell-wrap copy hideField={true} field='associate_name' row={row} message={text}>
              <side-page-trigger permission='server_get' name='VmInstanceSidePage' id={row.associate_id} vm={vm}>{text}</side-page-trigger>
            </list-body-cell-wrap>,
          ]
        }
        return text
      },
    },
  }
}
