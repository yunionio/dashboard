import i18n from '@/locales'
import {
  getNameFilter,
  getStatusFilter,
  getEnabledFilter,
  getTenantFilter,
  getDomainFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'

export const filterOptions = {
  id: {
    label: i18n.t('table.title.id'),
  },
  name: getNameFilter(),
  status: getStatusFilter('image'),
  enabled: getEnabledFilter(),
  auto_cache: getEnabledFilter({
    label: i18n.t('aice.mounted_apps.auto_cache'),
  }),
  model_id: {
    label: 'Model ID',
  },
  model_name: {
    label: i18n.t('aice.model_name'),
  },
  llm_type: {
    label: 'LLM Type',
  },
  projects: getTenantFilter(),
  project_domains: getDomainFilter(),
  created_at: getCreatedAtFilter(),
}
