import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'distribution',
        title: i18n.t('k8s.text_401'),
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            let title = 'Kubernetes'
            let type = 'k8s'
            const styles = { color: 'rgb(50, 109, 230)', fontSize: '20px' }
            if (row.distribution === 'openshift') {
              title = 'OpenShift'
              type = 'openshift'
              styles.color = 'rgb(225, 38, 52)'
            }
            if (row.distribution_info && row.distribution_info.version) {
              title += `(${row.distribution_info.version})`
            }
            return [
              <div class="d-inline-flex align-items-center flex-column">
                <Icon class="d-block text-left" type={ type } style={ styles } />
                <div>{ title }</div>
              </div>,
            ]
          },
        },
      },
      {
        field: 'mode',
        title: i18n.t('k8s.text_186'),
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
        minWidth: 100,
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
      },
      {
        field: 'is_public',
        title: i18n.t('k8s.text_192'),
        formatter: ({ cellValue }) => {
          return cellValue ? i18n.t('k8s.text_193') : i18n.t('k8s.text_194')
        },
      },
      getStatusTableColumn({ statusModule: 'kubecluster', minWidth: 40 }),
      {
        field: 'domain',
        title: i18n.t('dictionary.domain'),
      },
    ]
  },
}
