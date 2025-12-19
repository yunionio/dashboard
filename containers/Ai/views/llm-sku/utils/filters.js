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
  created_at: getCreatedAtFilter(),
}
