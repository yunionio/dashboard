import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'
import i18n from '@/locales'

/**
 * 同步任务列表筛选：各层（账号/订阅/区域）均支持状态、启动方式
 * @param {Object} opts
 * @param {boolean} [opts.withLevel=false] 顶层列表可按层级筛选
 */
export function getCloudaccountSyncTaskFilterOptions ({ withLevel = false } = {}) {
  const filters = {
    name: getNameFilter(),
    status: getStatusFilter({ statusModule: 'cloudaccountSyncTasks' }),
    mode: {
      label: i18n.t('cloudenv.bill_task.task_mode'),
      dropdown: true,
      multiple: true,
      items: [
        { key: 'auto', label: i18n.t('cloudenv.bill_task.task_mode.auto') },
        { key: 'manual', label: i18n.t('cloudenv.bill_task.task_mode.manual') },
      ],
      filter: true,
      formatter: val => {
        return `mode.in(${val.map(item => `'${item}'`).join(',')})`
      },
    },
  }
  if (withLevel) {
    filters.level = {
      label: i18n.t('cloudenv.sync_task.level'),
      dropdown: true,
      items: [
        { key: 'account', label: i18n.t('cloudenv.sync_task.level.account') },
        { key: 'provider', label: i18n.t('cloudenv.sync_task.level.provider') },
        { key: 'region', label: i18n.t('cloudenv.sync_task.level.region') },
      ],
    }
  }
  return filters
}
