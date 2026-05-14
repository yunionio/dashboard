import i18n from '@/locales'
import {
  getNameFilter,
  getStatusFilter,
  getTenantFilter,
  getDomainFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'

export const filterOptions = {
  id: {
    label: i18n.t('table.title.id'),
  },
  name: getNameFilter(),
  status: getStatusFilter('llmDeployment'),
  llm_sku: {
    label: i18n.t('aice.llm_sku'),
  },
  placement_strategy: {
    label: i18n.t('aice.llm_deployment.placement_strategy'),
    dropdown: true,
    items: [
      { label: 'Spread', key: 'spread' },
      { label: 'Binpack', key: 'binpack' },
    ],
  },
  access_policy: {
    label: i18n.t('aice.llm_deployment.access_policy'),
    dropdown: true,
    items: [
      { label: i18n.t('aice.llm_deployment.access_policy.public'), key: 'public' },
      { label: i18n.t('aice.llm_deployment.access_policy.authed'), key: 'authed' },
      { label: i18n.t('aice.llm_deployment.access_policy.allowed_users'), key: 'allowed_users' },
    ],
  },
  projects: getTenantFilter(),
  project_domains: getDomainFilter(),
  created_at: getCreatedAtFilter(),
}
