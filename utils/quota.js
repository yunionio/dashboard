import { initProjectQuota, initDomainQuota } from '@/constants/quota'
import i18n from '@/locales'

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
    label: i18n.t('common_295'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  {
    key: 'globalvpc',
    label: i18n.t('common_307'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  // 认证配额
  {
    key: 'group',
    label: i18n.t('common_308'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  {
    key: 'policy',
    label: i18n.t('common_309'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  {
    key: 'project',
    label: i18n.t('common_310'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  {
    key: 'role',
    label: i18n.t('common_311'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  {
    key: 'user',
    label: i18n.t('common_312'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  // 基础设施配额
  {
    key: 'host',
    label: i18n.t('common_305'),
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
  {
    key: 'vpc',
    label: 'VPC',
    max: 0,
    step: 1,
    unit: i18n.t('common_61'),
    remaining: 0,
  },
]
