import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

export const usageConfig = {
  'usage_active,vm_cpu': {
    formatter: val => `${parseInt(val)}%`,
  },
  'usage_active,agent_cpu': {
    formatter: val => `${parseInt(val)}%`,
  },
  'used_percent,vm_mem': {
    formatter: val => `${parseInt(val)}%`,
  },
  'used_percent,agent_mem': {
    formatter: val => `${parseInt(val)}%`,
  },
  'used_percent,agent_disk': {
    formatter: val => `${parseInt(val)}%`,
  },
  'used_percent,vm_disk': {
    formatter: val => `${parseInt(val)}%`,
  },
  'read_bps,vm_diskio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'write_bps,vm_diskio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'bps_recv,vm_netio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'bps_sent,vm_netio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'usage_active,cpu': {
    formatter: val => `${parseInt(val)}%`,
  },
  'used_percent,mem': {
    formatter: val => `${parseInt(val)}%`,
  },
  'bps_recv,net': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'bps_sent,net': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
}

export const serverUsageOptions = [
  { label: i18n.t('dashboard.text_61'), key: 'usage_active,vm_cpu' },
  { label: i18n.t('dashboard.text_61_agent'), key: 'usage_active,agent_cpu' },
  { label: i18n.t('monitor_metric_85'), key: 'used_percent,vm_mem' },
  { label: i18n.t('monitor_metric_85_agent'), key: 'used_percent,agent_mem' },
  { label: i18n.t('monitor.metrics_disk_used_percent'), key: 'used_percent,vm_disk' },
  { label: i18n.t('monitor.metrics_disk_used_percent_agent'), key: 'used_percent,agent_disk' },
  { label: i18n.t('dashboard.text_62'), key: 'read_bps,vm_diskio' },
  { label: i18n.t('dashboard.text_63'), key: 'write_bps,vm_diskio' },
  { label: i18n.t('dashboard.text_64'), key: 'bps_recv,vm_netio' },
  { label: i18n.t('dashboard.text_65'), key: 'bps_sent,vm_netio' },
]
export const hostUsageOptions = [
  { label: i18n.t('dashboard.text_61'), key: 'usage_active,cpu' },
  { label: i18n.t('dashboard.text_46'), key: 'used_percent,mem' },
  { label: i18n.t('dashboard.text_64'), key: 'bps_recv,net' },
  { label: i18n.t('dashboard.text_65'), key: 'bps_sent,net' },
]
