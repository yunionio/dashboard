import { initProjectQuota, initDomainQuota } from '@/constants/quota'

export function initQuota (mdf = 'project') {
  if (mdf === 'project') {
    return initProjectQuota
  }
  return initDomainQuota
}

export const domainQuotaOptions = [
  // 域配额
  {
    key: 'cloudaccount',
    label: '云账号',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  {
    key: 'globalvpc',
    label: '全局VPC',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  // 认证配额
  {
    key: 'group',
    label: '组',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  {
    key: 'policy',
    label: '权限',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  {
    key: 'project',
    label: '项目',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  {
    key: 'role',
    label: '角色',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  {
    key: 'user',
    label: '用户',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  // 基础设施配额
  {
    key: 'host',
    label: '宿主机',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
  {
    key: 'vpc',
    label: 'VPC',
    max: 0,
    step: 1,
    unit: '个',
    remaining: 0,
  },
]
