
// 公有云计费方式配置选项
export const BILL_TYPES_MAP = {
  postpaid: {
    label: '按量付费',
    key: 'postpaid',
  },
  prepaid: {
    label: '包年包月',
    key: 'prepaid',
  },
}

export const BUY_DURATIONS_OPTIONS = [
  {
    label: '1个月',
    value: '1M',
    unit: 'M',
  },
  {
    label: '2个月',
    value: '2M',
    unit: 'M',
  },
  {
    label: '3个月',
    value: '3M',
    unit: 'M',
  },
  {
    label: '半年',
    value: '6M',
    unit: 'M',
  },
  {
    label: '1年',
    value: '1Y',
    unit: 'Y',
  },
  {
    label: '2年',
    value: '2Y',
    unit: 'Y',
  },
  {
    label: '3年',
    value: '3Y',
    unit: 'Y',
  },
]

// 账号权限
export const ACCOUNT_PRIVILEGES = {
  'read': '只读',
  'write': '读写',
  'repl': '复制',
}

export const ENGINE_KEYS = ['single', 'master', 'cluster', 'rwsplit']
// Elasticache机型翻译
export const ENGINE_ARCH = {
  'single': '基础版',
  'master': '高可用',
  'cluster': '集群',
  'rwsplit': '读写分离',
}

export const NODE_KEYS = ['single', 'double', 'readone', 'readthree', 'readfive']
// 节点类型翻译
export const NODE_TYPE = {
  'readthree': '只读节点（3个）',
  'readone': '只读节点（1个）',
  'readfive': '只读节点（5个）',
  'single': '单副本',
  'double': '双副本',
}

export const PERFORMANCE_TYPE_KEYS = ['standard', 'enhanced']
// 性能类型
export const PERFORMANCE_TYPE = {
  'standard': '标准性能',
  'enhanced': '增强性能',
}
