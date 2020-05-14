export const STRATEGY_CN = {
  prefer: '尽量使用',
  avoid: '避免使用',
  exclude: '禁止使用',
  // require: '必须使用',
  '': '无',
}

export const RES_TYPES = { hosts: '宿主机、物理机', storages: '存储', networks: '网络' }

export const STRATEGY_OPT = (() => Object.entries(STRATEGY_CN).map(val => ({ label: val[1], key: val[0] })))()
