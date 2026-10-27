import { POD_MONITOR } from '@Compute/views/vminstance-container/constants'
import { CONTAINER_MONITOR } from '@Compute/views/pod-container/constants'
import { HOST_AGENT_MONITOR } from '@Monitor/views/monitorresource/constants'
import { AGENT_MONITOR } from '@Compute/views/vminstance/constants'
import { RDS_MONITOR_ALL_OPTS, REDIS_MONITOR_ALL_OPTS } from '@DB/constants'
import { STORAGE_MONITOR_OPTS } from '@Storage/views/blockstorage/constants'
import { OSS_MONITOR_OPTS } from '@Storage/constants'

// 监控模板保存在「策略定义（scopedpolicies）」中，按分类区分资源类型
export const MONITOR_TEMPLATE_VMINSTANCE = 'vminstance_monitor_template'
// 容器主机（hypervisor 为 pod 的 server）
export const MONITOR_TEMPLATE_VMINSTANCE_CONTAINER = 'vminstance_container_monitor_template'
// 容器主机内的容器
export const MONITOR_TEMPLATE_CONTAINER = 'container_monitor_template'
// 宿主机（host）
export const MONITOR_TEMPLATE_HOST = 'host_monitor_template'
// RDS
export const MONITOR_TEMPLATE_RDS = 'rds_monitor_template'
// Redis
export const MONITOR_TEMPLATE_REDIS = 'redis_monitor_template'
// 块存储
export const MONITOR_TEMPLATE_BLOCKSTORAGE = 'blockstorage_monitor_template'
// 存储桶
export const MONITOR_TEMPLATE_BUCKET = 'bucket_monitor_template'
// 裸金属（hypervisor 为 baremetal 的 server），物理机复用同一套监控
export const MONITOR_TEMPLATE_BAREMETAL = 'baremetal_monitor_template'

export const MONITOR_TEMPLATE_CATEGORIES = [
  MONITOR_TEMPLATE_VMINSTANCE,
  MONITOR_TEMPLATE_HOST,
  MONITOR_TEMPLATE_VMINSTANCE_CONTAINER,
  MONITOR_TEMPLATE_CONTAINER,
  MONITOR_TEMPLATE_RDS,
  MONITOR_TEMPLATE_REDIS,
  MONITOR_TEMPLATE_BLOCKSTORAGE,
  MONITOR_TEMPLATE_BUCKET,
  MONITOR_TEMPLATE_BAREMETAL,
]

// 模板分类对应的资源信息（预览/查询用）
export const MONITOR_TEMPLATE_META = {
  // 虚拟机模板的监控资源类型可选：虚拟机(guest)、虚拟机 Agent(agent)
  [MONITOR_TEMPLATE_VMINSTANCE]: {
    res_type: 'guest',
    res_types: ['guest', 'agent'],
    resource: 'servers',
    apiVersion: 'v1',
    idKey: 'vm_id',
  },
  // 宿主机监控：cpu/mem/disk/diskio/net(含 system) 等宿主机 Agent 的测量项，按 host_id 查询
  [MONITOR_TEMPLATE_HOST]: {
    res_type: 'host',
    resource: 'hosts',
    apiVersion: 'v1',
    idKey: 'host_id',
    // 宿主机测量项没有统一前缀，按实际测量项名称匹配（含温度类）
    measurements: [...new Set(['system', 'agent_sensors', 'agent_smart_device', ...HOST_AGENT_MONITOR.map(item => item.fromItem)])],
  },
  // 容器主机监控：pod_ 前缀的测量项，按容器主机的 vm_id 查询
  [MONITOR_TEMPLATE_VMINSTANCE_CONTAINER]: {
    res_type: 'guest',
    resource: 'servers',
    apiVersion: 'v1',
    idKey: 'vm_id',
    resourceParams: { filter: 'hypervisor.in(pod)' },
    measurementPrefixes: ['pod_'],
    // 容器主机实际使用的测量项（前缀兜底，避免不同环境测量项命名不一致时列表为空）
    measurements: POD_MONITOR.map(item => item.fromItem),
  },
  // 容器监控：container_ 前缀的测量项，按 pod_id + container_name 查询
  [MONITOR_TEMPLATE_CONTAINER]: {
    res_type: 'guest',
    resource: 'containers',
    apiVersion: 'v2',
    idKey: 'pod_id',
    measurementPrefixes: ['container_'],
    measurements: CONTAINER_MONITOR.map(item => item.fromItem),
    // 预览与查询需要容器的 pod_id、container_name 等标签
    needResourceDetail: true,
    extraTags: row => [
      { key: 'pod_id', value: row.guest_id, operator: '=' },
      { key: 'container_name', value: row.name, operator: '=' },
    ],
  },
  // RDS：rds_ 前缀的测量项，按 rds_id 查询
  [MONITOR_TEMPLATE_RDS]: {
    res_type: 'rds',
    resource: 'dbinstances',
    apiVersion: 'v2',
    idKey: 'rds_id',
    measurementPrefixes: ['rds_'],
    measurements: RDS_MONITOR_ALL_OPTS.map(item => item.fromItem),
  },
  // Redis：dcs_ 前缀的测量项，按 redis_id 查询
  [MONITOR_TEMPLATE_REDIS]: {
    res_type: 'redis',
    resource: 'elasticcaches',
    apiVersion: 'v2',
    idKey: 'redis_id',
    measurementPrefixes: ['dcs_'],
    measurements: REDIS_MONITOR_ALL_OPTS.map(item => item.fromItem),
  },
  // 块存储：storage 测量项，按存储 id 查询
  [MONITOR_TEMPLATE_BLOCKSTORAGE]: {
    res_type: 'storage',
    resource: 'storages',
    apiVersion: 'v1',
    idKey: 'id',
    measurements: STORAGE_MONITOR_OPTS.map(item => item.fromItem),
  },
  // 存储桶：oss_ 前缀的测量项，按 oss_id 查询
  [MONITOR_TEMPLATE_BUCKET]: {
    res_type: 'bucket',
    resource: 'buckets',
    apiVersion: 'v1',
    idKey: 'oss_id',
    measurementPrefixes: ['oss_'],
    measurements: Object.keys(OSS_MONITOR_OPTS).reduce((ret, brand) => ret.concat(OSS_MONITOR_OPTS[brand].map(item => item.fromItem)), []),
  },
  // 裸金属：与虚拟机 Agent 监控同一套测量项，按裸金属 server 的 vm_id 查询
  [MONITOR_TEMPLATE_BAREMETAL]: {
    res_type: 'agent',
    res_types: ['agent'],
    resource: 'servers',
    apiVersion: 'v1',
    idKey: 'vm_id',
    resourceParams: { filter: 'hypervisor.in(baremetal)' },
    measurements: AGENT_MONITOR.map(item => item.fromItem),
  },
}

export function isMonitorTemplateCategory (category) {
  return MONITOR_TEMPLATE_CATEGORIES.includes(category)
}

/**
 * 判断测量项是否属于该模板
 * @param {Object} meta MONITOR_TEMPLATE_META 中的一项
 * @param {String} measurement 测量项名称
 */
export function matchTemplateMeasurement (meta, measurement) {
  const name = String(measurement || '')
  if (!name) return false
  const prefixes = (meta && meta.measurementPrefixes) || []
  const names = (meta && meta.measurements) || []
  if (!prefixes.length && !names.length) return true
  return names.includes(name) || prefixes.some(prefix => name.startsWith(prefix))
}

/**
 * 监控指标归属：Agent 资源类型或 agent_ 前缀的测量项属于 Agent 监控，其余为基础监控
 * @param {String} fromItem 测量项（measurement）
 * @param {String} resType 监控资源类型
 */
export function resolvePanelMonitorType (fromItem, resType) {
  if (resType === 'agent') return 'agent'
  return String(fromItem || '').startsWith('agent_') ? 'agent' : 'basic'
}

/**
 * 从策略数据中取出监控模板面板
 * @param {Object} scopedPolicy store 中的 scopedPolicy
 * @param {Object} options { category, monitorType }
 * @returns {Array} 面板列表（无模板时返回空数组）
 */
export function resolveMonitorTemplatePanels (scopedPolicy, { category, monitorType = 'basic' } = {}) {
  const policy = (scopedPolicy || {})[category] || {}
  const panels = Array.isArray(policy) ? policy : (policy.panels || [])
  return panels
    .filter(item => (item.monitor_type || resolvePanelMonitorType(item.fromItem, item.res_type)) === monitorType)
    .map(item => ({ ...item }))
}
