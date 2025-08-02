import i18n from '@/locales'
import { HYPERVISORS_MAP } from '@/constants'
import BrandIcon from '@/sections/BrandIcon'

export const getK8sClusterProviderColumn = () => {
  return {
    title: i18n.t('k8s.platform'),
    field: 'provider',
    sortable: true,
    slots: {
      default: ({ row }, h) => {
        if (!row.provider) return '-'
        if (row.provider === 'onecloud') {
          row.provider = 'kvm'
        }
        const data = HYPERVISORS_MAP[row.provider]
        if (!data || !data.brand) return '-'
        return [
          <BrandIcon name={ data.brand } />,
        ]
      },
    },
  }
}

export const getK8sClusterDistribution = () => {
  return {
    field: 'distribution',
    title: i18n.t('k8s.text_401'),
    minWidth: 100,
    sortable: true,
    slots: {
      default: ({ row }, h) => {
        let title = ''
        // let title = 'Kubernetes'
        let type = 'k8s'
        const styles = { color: 'rgb(50, 109, 230)', fontSize: '20px' }
        if (row.distribution === 'openshift') {
          // title = 'OpenShift'
          type = 'openshift'
          styles.color = 'rgb(225, 38, 52)'
        }
        if (row.distribution_info && row.distribution_info.version) {
          title += `${row.distribution_info.version}`
        } else if (row.version) {
          title += `${row.version} `
        }
        return [
          <div class="d-inline-flex align-items-right flex-column">
            <Icon class="d-block text-left" type={ type } style={ styles } />
            <div>{ title }</div>
          </div>,
        ]
      },
    },
  }
}

export const getK8sClusterModeColumn = () => {
  return {
    field: 'mode',
    title: i18n.t('k8s.text_186'),
    sortable: true,
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
  }
}

export const getK8sClusterResourceType = () => {
  return {
    field: 'resource_type',
    title: i18n.t('k8s.text_188'),
    sortable: true,
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
  }
}
