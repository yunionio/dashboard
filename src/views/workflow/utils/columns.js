import _ from 'lodash'
import i18n from '@/locales'
import { PRIORITY_MAP, WORKFLOW_TYPES } from '@/constants/workflow'
import { getWorkflowParamter } from '@/utils/utils'
import store from '@/store'
import { statusMap, auditStatusMap } from './index'

export const getProcessDefinitionNameTableColumn = ({ field = 'process_definition_name', title = i18n.t('common_375') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (row.process_definition_key === 'apply-internal-resource' || (row.process_definition_id || '').indexOf('apply-internal-resource') !== -1) {
        const paramter = row.variables['server-create-paramter'] || row.variables.paramter
        let rs = paramter ? JSON.parse(paramter) : {}
        let name = rs.generate_name || rs.name
        if (Array.isArray(rs)) {
          name = rs.map((item) => item.name).join(',')
        }
        if (!name) {
          name = '-'
        }
        rs = getWorkflowParamter(row.variables)
        const { process_type = {} } = rs
        return i18n.t(`system_process_type.${process_type.id}`)
      } else {
        return _.get(row, field, '-')
      }
    },
  }
}

export const getResourceSourceTableColumn = ({ field = 'source', title = i18n.t('wz_workflow_form.labels.source') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (row.process_definition_key === 'apply-internal-resource' || (row.process_definition_id || '').indexOf('apply-internal-resource') !== -1) {
        const paramter = row.variables['server-create-paramter'] || row.variables.paramter
        const rs = paramter ? JSON.parse(paramter) : {}
        const { process_id } = rs
        if (process_id) {
          return `${i18n.t('system.irs_orders')}-${process_id}`
        } else {
          return i18n.t('wz_workflow_form.type')
        }
      } else {
        return ''
      }
    },
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
          return '-'
        }
      },
    },
  }
}

export const getAreaTableColumn = ({ field = 'area', title = i18n.t('wz_workflow_form.labels.country') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      let f = field
      if (row.process_instance?.process_definition_key === 'apply-internal-resource' || row.process_definition_key === 'apply-internal-resource') {
        f = 'variables.project_name'
      }
      return _.get(row, f, '')
    },
    slots: {
      default: ({ row }, h) => {
        let f = field
        if (row.process_instance?.process_definition_key === 'apply-internal-resource' || row.process_definition_key === 'apply-internal-resource') {
          f = 'variables.project_name'
        }
        const project = _.get(row, f, '-')
        return [
          <list-body-cell-wrap copy row={row} hideField={true} message={project}>
            {project}
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}

const openResourceColumns = [
  {
    title: i18n.t('system.resource_type'),
    field: 'resource_type',
    formatter: ({ row }) => {
      return i18n.te(`wz_workflow_form.resource_types.${row.resource_type}`) ? i18n.t(`wz_workflow_form.resource_types.${row.resource_type}`) : row.resource_type
    },
  },
  {
    title: i18n.t('system.instance_name'),
    field: 'instance_name',
    formatter: ({ row }) => {
      return row.instance_name
    },
  },
  {
    title: i18n.t('system.instance_id'),
    field: 'instance_code',
    slots: {
      default: ({ row }, h) => {
        return row.instance_code
      },
    },
  },
  {
    title: 'IP',
    field: 'ip',
    slots: {
      default: ({ row }, h) => {
        return row.ip
      },
    },
  },
  {
    title: i18n.t('common_386'),
    field: 'details',
    formatter: ({ row }) => {
      const ret = []
      if (row.details) {
        const keys = Object.keys(row.details)
        const rows = keys.map(item => {
          return item + ': ' + row.details[item]
        })
        ret.push(...rows)
      }
      return ret.join(',')
    },
    slots: {
      default: ({ row }, h) => {
        const ret = []
        if (row.details) {
          const keys = Object.keys(row.details)
          const rows = keys.map(item => {
            return <a-tag class="mb-2">{item + ': ' + row.details[item]}</a-tag>
          })
          ret.push(<div>{...rows}</div>)
        }
        return ret
      },
    },
  },
]

const getOpenResourceDatas = ({ row }) => {
  const paramter = row.variables['server-create-paramter'] || row.variables.paramter
  const rs = paramter ? JSON.parse(paramter) : {}
  const { openResourceInfo = {} } = rs
  const { resources = [] } = openResourceInfo
  return resources
}

export const getOpenResourceTableColumns = () => {
  return {
    field: 'open_resource',
    title: i18n.t('system.open_resources'),
    type: 'expand',
    expandColumns: openResourceColumns,
    getExpandData: ({ row }) => {
      return getOpenResourceDatas({ row })
    },
    slots: {
      default: ({ row }, h) => {
        if (row.process_instance?.process_definition_key === 'apply-internal-resource' || row.process_definition_key === 'apply-internal-resource') {
          const paramter = row.variables['server-create-paramter'] || row.variables.paramter
          const rs = paramter ? JSON.parse(paramter) : {}
          const { openResourceInfo = {} } = rs
          const { resources = [] } = openResourceInfo
          return resources.length
        } else {
          return '-'
        }
      },
      content: ({ row }, h) => {
        if (row.process_instance?.process_definition_key === 'apply-internal-resource' || row.process_definition_key === 'apply-internal-resource') {
          const datas = getOpenResourceDatas({ row })
          const columns = openResourceColumns
          return <vxe-grid size="mini" border columns={columns} data={datas} />
        } else {
          return '-'
        }
      },
    },
  }
}

export const internalResourceColumns = () => {
  const ret = []
  if (store.getters.workflow.enableApplyInternalResource) {
    ret.push(getResourceSourceTableColumn())
    ret.push(getAreaTableColumn())
    ret.push(getOpenResourceTableColumns())
  }
  return ret
}

export const getResourceNameTableColumn = ({ field = 'resource_name', title = i18n.t('common_151') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (!row.variables) return ''
      const paramter = row.variables['server-create-paramter'] || row.variables.paramter
      const rs = paramter ? JSON.parse(paramter) : {}
      let name = rs.generate_name || rs.name
      if (Array.isArray(rs)) {
        name = rs.map((item) => item.name).join(',')
      }
      if (!name) {
        name = ''
      }
      if (row.process_definition_key === 'apply-internal-resource' || (row.process_definition_id || '').indexOf('apply-internal-resource') !== -1) {
        return ''
      } else {
        return name
      }
    },
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
          return '-'
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
    formatter: ({ row }) => {
      return _.get(row, field, '-')
    },
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
    formatter: ({ row }) => {
      return _.get(row, field, '-')
    },
  }
}

export const getCommentTableColumn = ({ field = 'comment', title = i18n.t('common_438') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      const variables = row.variables
      if (variables.comment) {
        return variables.comment
      }
      return '-'
    },
  }
}

export const getPriorityTableColumn = () => {
  return {
    field: 'priority',
    title: i18n.t('common.workflow_priority'),
    minWidth: 80,
    showOverflow: 'title',
    foramtter: ({ row }) => {
      const veriables = row.variables
      if (veriables.priority && PRIORITY_MAP[veriables.priority]) {
        return PRIORITY_MAP[veriables.priority].value
      }
      return '-'
    },
  }
}

export const getStateTableColumn = ({ field = 'state', title = i18n.t('common_372') } = { }) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      const statusObj = statusMap(row.process_definition_key)[row.state]
      return statusObj ? statusObj.text : ''
    },
    slots: {
      default: ({ row }, h) => {
        const statusObj = statusMap(row.process_definition_key)[row.state]
        if (statusObj) {
          return [
            <span style={{ color: statusObj.color }}>{statusObj.text}</span>,
          ]
        }
      },
    },
  }
}

export const getAuditStatusTableColumn = ({ field = 'audit_status', title = i18n.t('common_401') } = {}) => {
  return {
    field,
    title,
    minWidth: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (row.variables.audit_status) {
        const statusObj = auditStatusMap(row.process_definition_key)[row.variables.audit_status]
        if (row.process_definition_key === WORKFLOW_TYPES.CUSTOMER_SERVICE) {
          return row.audit_state
        }
        if (statusObj) {
          return statusObj.text
        }
      }
      return ''
    },
    slots: {
      default: ({ row }, h) => {
        if (row.variables.audit_status) {
          const statusObj = auditStatusMap(row.process_definition_key)[row.variables.audit_status]
          if (row.process_definition_key === WORKFLOW_TYPES.CUSTOMER_SERVICE) {
            return [
              <span style="color: #f6a100;">{row.audit_state}</span>,
            ]
          }
          if (statusObj) {
            return [
              <span style={{ color: statusObj.color }}>{statusObj.text}</span>,
            ]
          }
        }
      },
    },
  }
}

export const getStatusTableColumn = ({ field = 'status', title = i18n.t('common_402') } = {}) => {
  return {
    field,
    title,
    minWidth: 100,
    showOverflow: 'title',
    // sortable: true,
    formatter: ({ row }) => {
      const bizStatus = row.variables.biz_status
      if ((row.state === 'COMPLETED' || row.state === 'CUSTOM_TODO') && bizStatus) {
        const s = `status.workflowBiz.${bizStatus}`
        return i18n.te(s) ? i18n.t(s) : s
      }
      return '-'
    },
    slots: {
      default: ({ row }, h) => {
        const bizStatus = row.variables.biz_status
        const tooltip = <span class='ml-1'><a-tooltip title={i18n.t('workflow.biz_field')}><a-icon type="question-circle" /></a-tooltip></span>
        if ((row.state === 'COMPLETED' || row.state === 'CUSTOM_TODO') && bizStatus) {
          return [
            <div class="d-flex"><status status={bizStatus} statusModule={'workflowBiz'} />{bizStatus === 'fail' ? tooltip : null}</div>,
          ]
        }
        return '-'
      },
    },
  }
}

export const getAssigneeTableColumn = ({ field = 'assignee', title = i18n.t('common_399') } = {}) => {
  return {
    field,
    title,
    width: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      const assignees = []
      if (Array.isArray(row.tasks)) {
        row.tasks.forEach((item) => {
          if (!item.delete_reason) {
            assignees.push(item.assignee_displayname || item.assignee_name)
          }
        })
      } else {
        if (row.tasks && !row.delete_reason) {
          assignees.push(row.tasks.assignee_displayname || row.tasks.assignee_name)
        }
      }
      return assignees.length > 0 ? assignees.join(',') : '-'
    },
  }
}
