import { NOTIFY_SUBSCRIBER_TYPES_MAP, NOTIFY_ROLE_SCOPES_MAP } from '@IAM/constants'
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'

import i18n from '@/locales'

export default {
  created () {
    // 资源范围、启用状态、类型、接收对象
    this.columns = [
      {
        title: i18n.t('system.notify.topic.receiver.resource_scope'),
        field: 'resource_scope',
        sortable: true,
        showOverflow: 'ellipsis',
        formatter: ({ row }) => {
          if (row.resource_scope === 'system') {
            return this.$t('cloudenv.text_504')
          } else if (row.resource_scope === 'domain') {
            return this.$t('cloudenv.text_505', [row.resource_attribution_name || row.resource_attribution_id])
          } else if (row.resource_scope === 'project') {
            return this.$t('cloudenv.text_506', [row.resource_attribution_name || row.resource_attribution_id])
          } else {
            return this.resource_scope
          }
        },
      },
      getEnabledTableColumn(),
      {
        title: i18n.t('system.text_48'),
        field: 'type',
        sortable: true,
        minWidth: 100,
        showOverflow: 'title',
        formatter: ({ row }) => {
          return NOTIFY_SUBSCRIBER_TYPES_MAP[row.type] ? NOTIFY_SUBSCRIBER_TYPES_MAP[row.type].label : '-'
        },
      },
      {
        title: i18n.t('system.notify.subscriber.receivers'),
        field: 'receivers',
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        formatter: ({ row }) => {
          if (row.type === 'robot') {
            return row.robot ? row.robot.name : '-'
          } else if (row.type === 'role') {
            if (!row.role) return '-'
            if (!row.role_scope) return row.role.name
            const scope = NOTIFY_ROLE_SCOPES_MAP[row.role_scope]
            if (!scope) return row.role.name
            return `${row.role.name} (${scope.label})`
          } else if (row.type === 'receiver') {
            if (!row.receivers) return '-'
            const ret = []
            for (const r of row.receivers) {
              if (r.name) {
                ret.push(r.name)
              }
            }
            return ret.join(' ,')
          } else {
            return '-'
          }
        },
      },
    ]
  },
}
