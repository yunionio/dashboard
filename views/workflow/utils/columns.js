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
      default: ({ row }) => {
        return _.get(row, field, '-')
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
        const paramter = row.variables['server-create-paramter'] || row.variables.parameter
        const rs = paramter ? JSON.parse(paramter) : {}
        let name = rs.generate_name || rs.name
        if (Array.isArray(rs)) {
          name = rs.map((item) => item.name).join(',')
        }
        return [
          <list-body-cell-wrap copy row={row} hideField={ true } message={ name }>
            { name }
          </list-body-cell-wrap>,
        ]
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
        const project = _.get(row, field, '-')
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

export const getCommentTableColumn = () => {
  return {
    field: 'comment',
    title: i18n.t('common_438'),
    minWidth: 80,
    showOverflow: 'title',
    slots: {
      default: ({ row }) => {
        const veriables = JSON.parse(row.variables || '{}')
        return veriables.comment || '-'
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
