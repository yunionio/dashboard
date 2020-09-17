import { getNameDescriptionTableColumn, isPublicTableColumn, getTimeTableColumn, getProjectDomainTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: true,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'type',
        title: i18n.t('helm.text_92'),
        minWidth: 80,
        formatter: ({ row }) => {
          if (row.type === 'internal') return i18n.t('helm.text_14')
          if (row.type === 'external') return i18n.t('helm.text_15')
          return '-'
        },
      },
      {
        field: 'mountedBy',
        minWidth: 80,
        title: i18n.t('helm.text_102'),
        formatter: ({ row }) => row.mountedBy ? row.mountedBy.length : '-',
      },
      {
        field: 'url',
        title: i18n.t('helm.text_96'),
        minWidth: '200px',
        slots: {
          default: ({ row }, h) => {
            const formRules = [
              { required: true, message: i18n.t('helm.text_94'), trigger: 'blur' },
              { validator: this.$validate('url') },
            ]
            return [h('list-body-cell-wrap', {
              props: {
                copy: true,
                edit: true,
                row,
                onManager: this.onManager,
                field: 'url',
                formRules,
              },
            })]
          },
        },
      },
      isPublicTableColumn(),
      getProjectDomainTableColumn(),
      getTimeTableColumn({ field: 'created_at', fromNow: true, sortable: true }),
    ]
  },
}
