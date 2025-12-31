import i18n from '@/locales'

const ServerMetricOptions = [
  { label: i18n.t('monitor.overview_tab_usage_active'), measurement: 'vm_cpu', field: 'usage_active', format: '0.00 %', value: 0, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.overview_tab_usage_active_agent'), measurement: 'agent_cpu', field: 'usage_active', format: '0.00 %', value: 1, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor_metric_85'), measurement: 'vm_mem', field: 'used_percent', format: '0.00 %', value: 2, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor_metric_85_agent'), measurement: 'agent_mem', field: 'used_percent', format: '0.00 %', value: 3, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.metrics_disk_used_percent'), measurement: 'vm_disk', field: 'used_percent', format: '0.00 %', value: 4, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.metrics_disk_used_percent_agent'), measurement: 'agent_disk', field: 'used_percent', format: '0.00 %', value: 5, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.overview_tab_read_bps'), measurement: 'vm_diskio', field: 'read_bps', format: '0.00 Bps', value: 6, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.overview_tab_write_bps'), measurement: 'vm_diskio', field: 'write_bps', format: '0.00 Bps', value: 7, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.overview_tab_bps_recv'), measurement: 'vm_netio', field: 'bps_recv', format: '0.00 Bps', value: 8, supportFucTypes: ['sum'] },
  { label: i18n.t('monitor.overview_tab_bps_sent'), measurement: 'vm_netio', field: 'bps_sent', format: '0.00 Bps', value: 9, supportFucTypes: ['sum'] },
]

const HostMetricOptions = [
  { label: i18n.t('monitor.overview_tab_usage_active'), measurement: 'cpu', field: 'usage_active', format: '0.00 %', value: 0, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.overview_tab_read_bps'), measurement: 'diskio', field: 'read_bps', format: '0.00 Bps', value: 1, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.overview_tab_write_bps'), measurement: 'diskio', field: 'write_bps', format: '0.00 Bps', value: 2, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.overview_tab_bps_recv'), measurement: 'net', field: 'bps_recv', format: '0.00 Bps', value: 3, supportFucTypes: ['sum'] },
  { label: i18n.t('monitor.overview_tab_bps_sent'), measurement: 'net', field: 'bps_sent', format: '0.00 Bps', value: 4, supportFucTypes: ['sum'] },
]

const RdsMetricOptions = [
  { label: i18n.t('monitor.overview_tab_usage_active'), measurement: 'rds_cpu', field: 'usage_active', format: '0.00 %', value: 0, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor_metric_85'), measurement: 'rds_mem', field: 'used_percent', format: '0.00 %', value: 1, supportFucTypes: ['min', 'max', 'mean'] },
  { label: i18n.t('monitor.metrics_disk_used_percent'), measurement: 'rds_disk', field: 'used_percent', format: '0.00 %', value: 2, supportFucTypes: ['min', 'max', 'mean'] },
]

const MetricOptions = {
  server: ServerMetricOptions,
  host: HostMetricOptions,
  rds: RdsMetricOptions,
}

export default MetricOptions
