// import { metricItems } from '@Compute/views/node-alert/constants'
import i18n from '@/locales'

export const GAUGEMSG = [
  {
    label: i18n.t('compute.text_517'),
    sql: {
      key: 'load1_pcore',
      db: 'system',
    },
    option: 'system',
    max: 4, // 最大长度
  },
  {
    label: i18n.t('compute.text_518'),
    option: 'mem',
    sql: {
      key: 'used_percent',
      db: 'mem',
    },
  },
  {
    label: i18n.t('compute.text_519'),
    option: 'diskio',
    sql: {
      key: 'ioutil',
      db: 'diskio',
    },
  },
  {
    label: i18n.t('compute.text_520'),
    option: 'disk',
    sql: {
      key: 'used_percent',
      db: 'disk',
    },
  },
  {
    label: i18n.t('compute.text_521'),
    option: 'net_in',
    sql: {
      key: 'if_in_percent',
      db: 'net',
    },
  },
  {
    label: i18n.t('compute.text_522'),
    option: 'net_out',
    sql: {
      key: 'if_out_percent',
      db: 'net',
    },
  },
]

export const HOST_TOP5 = {
  isKvm: [
    {
      name: 'cpu',
      label: i18n.t('compute.text_523'),
      seleteItem: 'cpu_usage_pcore',
      fromItem: 'vm_cpu',
      unit: '%',
    },
    {
      name: 'netio',
      label: i18n.t('compute.text_524'),
      seleteItem: 'bps_recv',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'netio',
      label: i18n.t('compute.text_525'),
      seleteItem: 'bps_sent',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: i18n.t('compute.text_526'),
      seleteItem: 'read_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: i18n.t('compute.text_527'),
      seleteItem: 'write_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
  ],
  noKvm: [
    {
      name: 'cpu',
      label: i18n.t('compute.text_523'),
      seleteItem: 'usage_active',
      fromItem: 'vm_cpu',
    },
    {
      name: 'netio',
      label: i18n.t('compute.text_524'),
      seleteItem: 'bps_recv',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'netio',
      label: i18n.t('compute.text_525'),
      seleteItem: 'bps_sent',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: i18n.t('compute.text_526'),
      seleteItem: 'read_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: i18n.t('compute.text_527'),
      seleteItem: 'write_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
  ],
}

// kvm 型宿主机监控数据
export const KVM_MONITOR_OPTS = [
  {
    name: 'load1_pcore',
    label: i18n.t('compute.metric.system_load1_pcore'),
    seleteItem: 'load1_pcore',
    as: i18n.t('compute.metric.system_load1_pcore'),
    fromItem: 'system',
    unit: '',
    transfer: 1,
    // metric: metricItems['bps_sent'].key, // 报警指标
  },
  {
    name: 'cpu',
    label: i18n.t('compute.text_523'),
    // seleteItem: 'usage_active,usage_idle,usage_user,usage_system,usage_iowait',
    seleteItem: 'usage_active',
    fromItem: 'cpu',
    groupBy: ['cpu'],
    as: i18n.t('compute.text_528'),
    unit: '%',
    transfer: 1,
    extraTags: [
      {
        key: 'cpu',
        value: 'cpu-total',
        operator: '=',
      },
    ],
    // metric: metricItems['usage_active,usage_idle,usage_user,usage_system,usage_iowait'].key, // 报警指标
  },
  /* {
    name: 'memCondition',
    label: i18n.t('compute.text_531'),
    seleteItem: 'used,free,total',
    as: i18n.t('compute.text_532'),
    fromItem: 'mem',
    unit: 'B',
    transfer: 1024,
    // metric: metricItems['used,free,total'].key, // 报警指标
  }, */
  {
    name: 'mem',
    label: i18n.t('compute.text_518'),
    seleteItem: 'used_percent,free_percent',
    // as: i18n.t('compute.text_518'),
    fromItem: 'mem',
    // groupBy: ['host_ip'],
    as: i18n.t('compute.text_518') + ',' + i18n.t('compute.metric.mem_free_percent'),
    unit: '%',
    transfer: 1,
    // metric: metricItems['used_percent'].key, // 报警指标
  },
  /* {
    name: 'free_percent',
    label: i18n.t('compute.metric.mem_free_percent'),
    seleteItem: 'free_percent',
    as: i18n.t('compute.metric.mem_free_percent'),
    fromItem: 'mem',
    unit: '%',
    transfer: 1,
    // metric: metricItems['bps_sent'].key, // 报警指标
  }, */
  /* {
    name: 'diskCondition',
    label: i18n.t('compute.text_534'),
    seleteItem: 'used,free,total',
    as: i18n.t('compute.text_535'),
    fromItem: 'disk',
    groupBy: ['path'],
    unit: 'B',
    transfer: 1024,
    // metric: metricItems['used,free,total'].key, // 报警指标
  }, */
  // {
  //   name: 'disk',
  //   label: i18n.t('compute.text_533'),
  //   seleteItem: 'used_percent',
  //   as: i18n.t('compute.text_533'),
  //   fromItem: 'disk',
  //   unit: '%',
  //   transfer: 1,
  //   // metric: metricItems['used_percent'].key, // 报警指标
  // },
  {
    name: 'disk_used_percent',
    label: i18n.t('compute.metric.disk_used_percent'),
    seleteItem: 'used_percent',
    // as: i18n.t('compute.metric.disk_used_percent'),
    fromItem: 'disk',
    groupBy: ['path'],
    unit: '%',
    transfer: 1,
    // metric: metricItems['bps_sent'].key, // 报警指标
  },
  {
    name: 'disk_read_only',
    label: i18n.t('compute.metric.disk_read_only'),
    seleteItem: 'read_only',
    // as: i18n.t('compute.metric.disk_inodes_used_percent'),
    fromItem: 'disk',
    groupBy: ['path'],
    unit: '',
    transfer: 1,
  },
  {
    name: 'disk_inodes_used_percent',
    label: i18n.t('compute.metric.disk_inodes_used_percent'),
    seleteItem: 'inodes_used_percent',
    // as: i18n.t('compute.metric.disk_inodes_used_percent'),
    fromItem: 'disk',
    groupBy: ['path'],
    unit: '%',
    transfer: 1,
    // metric: metricItems['bps_sent'].key, // 报警指标
  },
  // {
  //   name: 'disk',
  //   label: i18n.t('compute.text_519'),
  //   seleteItem: 'ioutil',
  //   as: i18n.t('compute.text_519'),
  //   fromItem: 'diskio',
  //   unit: '%',
  //   transfer: 1,
  //   // metric: metricItems['ioutil'].key, // 报警指标
  // },
  {
    name: 'read_bps',
    label: i18n.t('compute.text_538'),
    // as: i18n.t('compute.text_538'),
    seleteItem: 'read_bps',
    fromItem: 'diskio',
    groupBy: ['name'],
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['read_bps'].key, // 报警指标
  },
  {
    name: 'write_bps',
    label: i18n.t('compute.text_539'),
    // as: i18n.t('compute.text_539'),
    seleteItem: 'write_bps',
    fromItem: 'diskio',
    groupBy: ['name'],
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['write_bps'].key, // 报警指标
  },
  {
    name: 'disk',
    label: i18n.t('compute.text_536'),
    seleteItem: 'read_iops,write_iops',
    as: i18n.t('compute.text_537'),
    fromItem: 'diskio',
    unit: 'iops',
    transfer: 1,
    // metric: metricItems['read_iops,write_iops'].key, // 报警指标
  },
  {
    name: 'diskio_ioutil',
    label: i18n.t('compute.metric.diskio_ioutil'),
    seleteItem: 'ioutil',
    // as: i18n.t('compute.metric.disk_inodes_used_percent'),
    fromItem: 'diskio',
    groupBy: ['name'],
    unit: '%',
    transfer: 1,
  },
  {
    name: 'bps_recv',
    label: i18n.t('compute.text_524'),
    seleteItem: 'bps_recv',
    // as: i18n.t('compute.text_524'),
    fromItem: 'net',
    groupBy: ['interface'],
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_recv'].key, // 报警指标
  },
  {
    name: 'bps_sent',
    label: i18n.t('compute.text_525'),
    seleteItem: 'bps_sent',
    // as: i18n.t('compute.text_525'),
    fromItem: 'net',
    groupBy: ['interface'],
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_sent'].key, // 报警指标
  },
  /* {
    name: 'system',
    label: i18n.t('compute.text_529'),
    seleteItem: 'load1,load5,load15,load1_pcore,load5_pcore,load15_pcore',
    as: i18n.t('compute.text_530'),
    fromItem: 'system',
    unit: '',
    transfer: 1,
    // metric: metricItems['load1,load5,load15,load1_pcore,load5_pcore,load15_pcore'].key, // 报警指标
  }, */

  {
    name: 'processes_zombies',
    label: i18n.t('compute.metric.processes_zombies'),
    seleteItem: 'zombies',
    as: i18n.t('compute.metric.processes_zombies'),
    fromItem: 'processes',
    unit: '',
    transfer: 1,
  },
  {
    name: 'processes_total',
    label: i18n.t('compute.metric.processes_total'),
    seleteItem: 'total',
    as: i18n.t('compute.metric.processes_total'),
    fromItem: 'processes',
    unit: '',
    transfer: 1,
  },
]

// vmware 型宿主机监控数据
export const VMWARE_MONITOR_OPTS = [
  {
    name: 'cpu',
    label: i18n.t('compute.text_523'),
    as: i18n.t('compute.text_523'),
    seleteItem: 'usage_active',
    fromItem: 'cpu',
    unit: '%',
    transfer: 1,
    // metric: metricItems['usage_active'].key, // 报警指标
  },
  {
    name: 'mem',
    label: i18n.t('compute.text_518'),
    as: i18n.t('compute.text_518'),
    seleteItem: 'used_percent',
    fromItem: 'mem',
    unit: '%',
    transfer: 1,
    // metric: metricItems['used_percent'].key, // 报警指标
  },
  {
    name: 'read_bps',
    label: i18n.t('compute.text_538'),
    as: i18n.t('compute.text_538'),
    seleteItem: 'read_bps',
    fromItem: 'diskio',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['read_bps'].key, // 报警指标
  },
  {
    name: 'write_bps',
    label: i18n.t('compute.text_539'),
    as: i18n.t('compute.text_539'),
    seleteItem: 'write_bps',
    fromItem: 'diskio',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['write_bps'].key, // 报警指标
  },
  {
    name: 'bps_recv',
    label: i18n.t('compute.text_524'),
    as: i18n.t('compute.text_524'),
    seleteItem: 'bps_recv',
    fromItem: 'net',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_recv'].key, // 报警指标
  },
  {
    name: 'bps_sent',
    label: i18n.t('compute.text_525'),
    as: i18n.t('compute.text_525'),
    seleteItem: 'bps_sent',
    fromItem: 'net',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_sent'].key, // 报警指标
  },
]

export const NIC_RSRC_MON_OPTS = [
  {
    name: 'load',
    label: 'NETINT load',
    // as: i18n.t('compute.text_525'),
    seleteItem: 'load',
    fromItem: 'ni_rsrc_mon',
    groupBy: ['device', 'dev_id', 'type'],
    unit: '',
    transfer: 1,
  },
  {
    name: 'model_load',
    label: 'NETINT model_load',
    // as: i18n.t('compute.text_525'),
    seleteItem: 'model_load',
    fromItem: 'ni_rsrc_mon',
    groupBy: ['device', 'dev_id', 'type'],
    unit: '',
    transfer: 1,
  },
  {
    name: 'inst',
    label: 'NETINT inst',
    // as: i18n.t('compute.text_525'),
    seleteItem: 'inst',
    fromItem: 'ni_rsrc_mon',
    groupBy: ['device', 'dev_id', 'type'],
    unit: '',
    transfer: 1,
  },
]

export const RADEONTOP_OPTS = [
  {
    name: 'utilization_gpu',
    label: i18n.t('compute.metric.radeontop_utilization_gpu'),
    as: i18n.t('compute.metric.radeontop_utilization_gpu'),
    seleteItem: 'utilization_gpu',
    fromItem: 'radeontop',
    groupBy: ['device_path', 'bus'],
    unit: '%',
    transfer: 1,
  },
  {
    name: 'utilization_memory',
    label: i18n.t('compute.metric.radeontop_utilization_memory'),
    as: i18n.t('compute.metric.radeontop_utilization_memory'),
    seleteItem: 'utilization_memory',
    fromItem: 'radeontop',
    groupBy: ['device_path', 'bus'],
    unit: '%',
    transfer: 1,
  },
  /* {
    name: 'utilization_gtt',
    label: i18n.t('compute.metric.radeontop_utilization_gtt'),
    as: i18n.t('compute.metric.radeontop_utilization_gtt'),
    seleteItem: 'utilization_gtt',
    fromItem: 'radeontop',
    groupBy: ['device_path', 'bus'],
    unit: '%',
    transfer: 1,
  },
  {
    name: 'utilization_clock_memory',
    label: i18n.t('compute.metric.radeontop_utilization_clock_memory'),
    as: i18n.t('compute.metric.radeontop_utilization_clock_memory'),
    seleteItem: 'utilization_clock_memory',
    fromItem: 'radeontop',
    groupBy: ['device_path', 'bus'],
    unit: '%',
    transfer: 1,
  },
  {
    name: 'utilization_clock_shader',
    label: i18n.t('compute.metric.radeontop_utilization_clock_shader'),
    as: i18n.t('compute.metric.radeontop_utilization_clock_shader'),
    seleteItem: 'utilization_clock_shader',
    fromItem: 'radeontop',
    groupBy: ['device_path', 'bus'],
    unit: '%',
    transfer: 1,
  }, */
]

export const VASMI_OPTS = [
  /* {
    name: 'temperature_gpu',
    label: i18n.t('compute.metric.vasmi_temperature_gpu'),
    as: i18n.t('compute.metric.vasmi_temperature_gpu'),
    seleteItem: 'temperature_gpu',
    fromItem: 'vasmi',
    groupBy: ['aic', 'dev_id'],
    unit: '',
    transfer: 1,
  }, */
  {
    name: 'utilization_gpu',
    label: i18n.t('compute.metric.vasmi_utilization_gpu'),
    as: i18n.t('compute.metric.vasmi_utilization_gpu'),
    seleteItem: 'utilization_gpu',
    fromItem: 'vasmi',
    groupBy: ['aic', 'dev_id'],
    unit: '%',
    transfer: 1,
  },
  {
    name: 'utilization_memory',
    label: i18n.t('compute.metric.vasmi_utilization_memory'),
    as: i18n.t('compute.metric.vasmi_utilization_memory'),
    seleteItem: 'utilization_memory',
    fromItem: 'vasmi',
    groupBy: ['aic', 'dev_id'],
    unit: '%',
    transfer: 1,
  },
  {
    name: 'utilization_encoder',
    label: i18n.t('compute.metric.vasmi_utilization_encoder'),
    as: i18n.t('compute.metric.vasmi_utilization_encoder'),
    seleteItem: 'utilization_encoder',
    fromItem: 'vasmi',
    groupBy: ['aic', 'dev_id'],
    unit: '%',
    transfer: 1,
  },
  {
    name: 'utilization_decoder',
    label: i18n.t('compute.metric.vasmi_utilization_decoder'),
    as: i18n.t('compute.metric.vasmi_utilization_decoder'),
    seleteItem: 'utilization_decoder',
    fromItem: 'vasmi',
    groupBy: ['aic', 'dev_id'],
    unit: '%',
    transfer: 1,
  },
]

export const MEM_USED_PERCENT = {
  name: 'mem',
  label: i18n.t('compute.text_518'),
  seleteItem: 'used_percent',
  as: i18n.t('compute.text_518'),
  fromItem: 'mem',
  unit: '%',
  transfer: 1,
}
export const CPU_USED_PERCENT = {
  name: 'cpu',
  label: i18n.t('compute.text_523'),
  as: i18n.t('compute.text_523'),
  seleteItem: 'usage_active',
  fromItem: 'cpu',
  unit: '%',
  transfer: 1,
}
export const DISK_USED_PERCENT = {
  name: 'disk_used_percent',
  label: i18n.t('compute.metric.disk_used_percent'),
  seleteItem: 'used_percent',
  // as: i18n.t('compute.metric.disk_used_percent'),
  fromItem: 'disk',
  // groupBy: ['path'],
  unit: '%',
  transfer: 1,
}

export const HOST_INFO_OPTS = [CPU_USED_PERCENT, MEM_USED_PERCENT, DISK_USED_PERCENT]
