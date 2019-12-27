export const GAUGEMSG = [
  {
    label: '系统负载',
    sql: {
      key: 'load1_pcore',
      db: 'system',
    },
    option: 'system',
    max: 4, // 最大长度
  },
  {
    label: '内存使用率',
    option: 'mem',
    sql: {
      key: 'used_percent',
      db: 'mem',
    },
  },
  {
    label: '磁盘IO使用率',
    option: 'diskio',
    sql: {
      key: 'ioutil',
      db: 'diskio',
    },
  },
  {
    label: '磁盘空间使用率',
    option: 'disk',
    sql: {
      key: 'used_percent',
      db: 'disk',
    },
  },
  {
    label: '网卡入带宽使用率',
    option: 'net_in',
    sql: {
      key: 'if_in_percent',
      db: 'net',
    },
  },
  {
    label: '网卡出带宽使用率',
    option: 'net_out',
    sql: {
      key: 'if_out_percent',
      db: 'net',
    },
  },
]
