import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        // editDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'mode',
        title: i18n.t('k8s.text_186'),
        minWidth: 80,
        formatter: ({ cellValue }) => {
          switch (cellValue) {
            case 'customize':
              return i18n.t('k8s.text_187')
            case 'import':
              return i18n.t('k8s.text_143')
            default:
              return '-'
          }
        },
      },
      {
        field: 'resource_type',
        title: i18n.t('k8s.text_188'),
        width: 70,
        formatter: ({ cellValue }) => {
          switch (cellValue) {
            case 'guest':
              return i18n.t('k8s.text_189')
            case 'host':
              return i18n.t('k8s.text_190')
            default:
              return '-'
          }
        },
      },
      {
        field: 'version',
        title: i18n.t('k8s.text_153'),
        width: 100,
        slots: {
          default: ({ row }, h) => {
            return [
              <a-tag color="blue">{ row.version }</a-tag>,
            ]
          },
        },
      },
      {
        field: 'machines',
        title: i18n.t('k8s.text_191'),
        width: 70,
      },
      {
        field: 'is_public',
        title: i18n.t('k8s.text_192'),
        width: 70,
        formatter: ({ cellValue }) => {
          return cellValue ? i18n.t('k8s.text_193') : i18n.t('k8s.text_194')
        },
      },
      getStatusTableColumn({ statusModule: 'kubecluster' }),
      getProjectTableColumn(),
    ]
  },
}
