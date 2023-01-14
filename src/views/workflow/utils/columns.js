import _ from 'lodash'
import i18n from '@/locales'
import { PRIORITY_MAP } from '@/constants/workflow'

export const getProcessDefinitionNameTableColumn = ({ field = 'process_definition_name', title = i18n.t('common_375') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        if (row.process_definition_key === 'apply-internal-resource' || (row.process_definition_id || '').indexOf('apply-internal-resource') !== -1) {
          const paramter = row.variables['server-create-paramter'] || row.variables.paramter
          const rs = paramter ? JSON.parse(paramter) : {}
          const { process_id } = rs
          const ret = []
          if (process_id) {
            ret.push(
              <list-body-cell-wrap copy row={{ process_id }} field="process_id" hideField={true}>
                {i18n.t('system.irs_orders')}-{process_id}
              </list-body-cell-wrap>,
            )
          } else {
            ret.push(<div>{i18n.t('wz_workflow_form.type')}</div>)
          }
          return ret
        } else {
          return _.get(row, field, '-')
        }
      },
    },
  }
}

export const getResourceNameTableColumn = ({ field = 'resource_name', title = i18n.t('common_151') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        if (!row.variables) return '-'
        const paramter = row.variables['server-create-paramter'] || row.variables.paramter
        const rs = paramter ? JSON.parse(paramter) : {}
        let name = rs.generate_name || rs.name
        if (Array.isArray(rs)) {
          name = rs.map((item) => item.name).join(',')
        }
        if (!name) {
          name = '-'
        }
        const ret = []
        if (row.process_definition_key === 'apply-internal-resource' || (row.process_definition_id || '').indexOf('apply-internal-resource') !== -1) {
          const { process_type } = rs
          ret.push(<div>{i18n.t(`system_process_type.${process_type.id}`)}</div>)
        } else {
          ret.push(
            <list-body-cell-wrap copy row={row} hideField={true} message={name}>
              {name}
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
  }
}

export const getResourceProjectTableColumn = ({ field = 'resource_project_name', title = i18n.t('common_310') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        let f = field
        if (row.process_instance?.process_definition_key === 'apply-internal-resource') {
          f = 'variables.project_name'
        }
        const project = _.get(row, f, '-')
        return [
          <list-body-cell-wrap copy row={row} hideField={ true } message={ project }>
            { project }
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}

export const getInitiatorTableColumn = ({ field = 'initiator' } = {}) => {
  return {
    field,
    title: i18n.t('common_371'),
    minWidth: 80,
    showOverflow: 'title',
    slots: {
      default: ({ row }) => {
        return _.get(row, field, '-')
      },
    },
  }
}

export const getCommentTableColumn = ({ field = 'comment', title = i18n.t('common_438') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    slots: {
      default: ({ row }) => {
        console.log(row)
        const variables = row.variables
        if (variables.comment) {
          return variables.comment
        }
        return '-'
      },
    },
  }
}

export const getPriorityTableColumn = () => {
  return {
    field: 'priority',
    title: i18n.t('common.workflow_priority'),
    minWidth: 80,
    showOverflow: 'title',
    slots: {
      default: ({ row }) => {
        const veriables = row.variables
        if (veriables.priority && PRIORITY_MAP[veriables.priority]) {
          return PRIORITY_MAP[veriables.priority].value
        }
        return '-'
      },
    },
  }
}
