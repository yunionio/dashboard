export const usageConfig = {
  'usage_active,vm_cpu': {
    formatter: val => `${parseInt(val)}%`,
  },
  'read_bps,vm_diskio': {
    formatter: val => `${parseInt(val)}%`,
  },
  'write_bps,vm_diskio': {
    formatter: val => `${parseInt(val)}%`,
  },
  'bps_recv,vm_netio': {
    formatter: val => `${parseInt(val)}%`,
  },
  'bps_sent,vm_netio': {
    formatter: val => `${parseInt(val)}%`,
  },
  'usage_active,cpu': {
    formatter: val => `${parseInt(val)}%`,
  },
  'used_percent,mem': {
    formatter: val => `${parseInt(val)}%`,
  },
  'bps_recv,net': {
    formatter: val => `${parseInt(val)}%`,
  },
  'bps_sent,net': {
    formatter: val => `${parseInt(val)}%`,
  },
}
