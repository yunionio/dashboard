import i18n from '@/locales'

const ServerMetricOptions = [
  { label: i18n.t('monitor.overview_tab_usage_active'), measurement: 'vm_cpu', field: 'usage_active', format: '0.00 %', value: 0 },
  { label: i18n.t('monitor.overview_tab_usage_active_agent'), measurement: 'agent_cpu', field: 'usage_active', format: '0.00 %', value: 1 },
  { label: i18n.t('monitor_metric_85'), measurement: 'vm_mem', field: 'used_percent', format: '0.00 %', value: 2 },
  { label: i18n.t('monitor_metric_85_agent'), measurement: 'agent_mem', field: 'used_percent', format: '0.00 %', value: 3 },
  { label: i18n.t('monitor.metrics_disk_used_percent'), measurement: 'vm_disk', field: 'used_percent', format: '0.00 %', value: 4 },
  { label: i18n.t('monitor.metrics_disk_used_percent_agent'), measurement: 'agent_disk', field: 'used_percent', format: '0.00 %', value: 5 },
  { label: i18n.t('monitor.overview_tab_read_bps'), measurement: 'vm_diskio', field: 'read_bps', format: '0.00 Bps', value: 6 },
  { label: i18n.t('monitor.overview_tab_write_bps'), measurement: 'vm_diskio', field: 'write_bps', format: '0.00 Bps', value: 7 },
  { label: i18n.t('monitor.overview_tab_bps_recv'), measurement: 'vm_netio', field: 'bps_recv', format: '0.00 Bps', value: 8 },
  { label: i18n.t('monitor.overview_tab_bps_sent'), measurement: 'vm_netio', field: 'bps_sent', format: '0.00 Bps', value: 9 },
]

const HostMetricOptions = [
  { label: i18n.t('monitor.overview_tab_usage_active'), measurement: 'cpu', field: 'usage_active', format: '0.00 %', value: 0 },
  { label: i18n.t('monitor.overview_tab_read_bps'), measurement: 'diskio', field: 'read_bps', format: '0.00 Bps', value: 1 },
  { label: i18n.t('monitor.overview_tab_write_bps'), measurement: 'diskio', field: 'write_bps', format: '0.00 Bps', value: 2 },
  { label: i18n.t('monitor.overview_tab_bps_recv'), measurement: 'net', field: 'bps_recv', format: '0.00 Bps', value: 3 },
  { label: i18n.t('monitor.overview_tab_bps_sent'), measurement: 'net', field: 'bps_sent', format: '0.00 Bps', value: 4 },
]

const MetricOptions = {
  server: ServerMetricOptions,
  host: HostMetricOptions,
}

export default MetricOptions
