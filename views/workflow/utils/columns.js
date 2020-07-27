import _ from 'lodash'

export const getProcessDefinitionNameTableColumn = ({ field = 'process_definition_name', title = '工单类型' } = {}) => {
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

export const getResourceNameTableColumn = ({ field = 'resource_name', title = '资源名称' } = {}) => {
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

export const getResourceProjectTableColumn = ({ field = 'resource_project_name', title = '项目' } = {}) => {
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
    title: '申请人',
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
    title: '问题描述',
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
