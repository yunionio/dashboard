import * as R from 'ramda'
import _ from 'lodash'
import i18n from '@/locales'

export const k8sStatusColumn = ({ path = 'podsInfo.warnings', statusModule = 'k8s_resource' } = {}) => {
  return {
    field: 'status',
    title: i18n.t('k8s.text_35'),
    width: 100,
    slots: {
      default: ({ row }, h) => {
        const warnings = (_.get(row, path) || []).map(v => v.message)
        let warnTooltip = null
        if (warnings && warnings.length) {
          warnTooltip = (
            <a-tooltip placement="top">
              <template slot="title">
                { warnings.map(val => (<div> { val } </div>)) }
              </template>
              <div class='text-truncate'>
                <a-icon type="bulb" theme="twoTone" twoToneColor="#f5222d" class="mr-2" />
                <span>{ i18n.t('K8s.text_402') }</span>
              </div>
            </a-tooltip>
          )
        }
        return [
          <div class='text-truncate'>
            <status status={ row.status } statusModule={ statusModule }>
              { warnTooltip }
            </status>
          </div>,
        ]
      },
    },
  }
}

export const k8sLabelColumn = ({ field = 'labels', title = i18n.t('k8s.text_82') } = {}) => {
  return {
    field,
    title,
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        if (!row[field] || !R.is(Object, row[field])) return '-'
        const colors = ['pink', 'orange', 'green', 'cyan', 'blue', 'purple', 'red']
        const labels = Object.entries(row[field]).map(arr => ({ key: arr[0], value: arr[1] }))
        return [
          <div>
            {
              labels.map((val, i) => {
                return (
                  <div class="mb-1"><a-tag class="d-block text-truncate" color={ colors[i % colors.length] }>{ `${val.key}：${val.value}` }</a-tag></div>
                )
              })
            }
          </div>,
        ]
      },
    },
  }
}

export const k8sImageColumn = ({ field = 'containerImages', title = i18n.t('k8s.text_42'), itemField = 'image' } = {}) => {
  return {
    field,
    title,
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        if (!row[field] || !row[field].length) return '-'
        return row[field].map(v => {
          return (
            <a-tooltip title={`${v.name}: ${v[itemField]}`}>
              <a-tag class="d-block text-truncate mb-1" style="max-width: 400px;">{v.name}: { v[itemField] }</a-tag>
            </a-tooltip>
          )
        })
      },
    },
  }
}

export const k8sEnvColumn = ({ field = 'env', title = i18n.t('k8s.text_111') } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        if (!row[field] || !R.is(Array, row[field])) return '-'
        return [
          <div>
            {
              row[field].map((val, i) => {
                return (
                  <a-tooltip title={ `${val.name}：${val.value || '-'}` }>
                    <div class="mb-1" title={`${val.name}：${val.value || '-'}`}><a-tag class="d-block text-truncate">{ `${val.name}：${val.value || '-'}` }</a-tag></div>
                  </a-tooltip>
                )
              })
            }
          </div>,
        ]
      },
    },
  }
}

export const federatedResClusterCountColumn = () => ({
  field: 'cluster_count',
  title: i18n.t('k8s.text_403'),
  minWidth: 100,
  formatter: ({ row }) => `${row.cluster_count}` || '-',
})
