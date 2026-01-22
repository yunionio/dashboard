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
  status: getStatusFilter('sku'),
  projects: getTenantFilter(),
  project_domains: getDomainFilter(),
  image: getNameFilter({ label: i18n.t('aice.image') }),
  llm_model_name: getNameFilter({ label: i18n.t('aice.model_name') }),
  created_at: getCreatedAtFilter(),
}
