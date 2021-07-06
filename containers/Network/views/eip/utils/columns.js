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
        let permission = 'server_get'
        let name = 'VmInstanceSidePage'
        if (row.associate_type === 'loadbalancer') {
          name = 'LbSidePage'
          permission = 'lb_loadbalancers_get'
        }
        if (vm) {
          return [
            <list-body-cell-wrap copy hideField={true} field='associate_name' row={row} message={text}>
              <side-page-trigger permission={permission} name={name} id={row.associate_id} vm={vm}>{text}</side-page-trigger>
            </list-body-cell-wrap>,
          ]
        }
        return text
      },
    },
  }
}
