import i18n from '@/locales'
import {
  getNameFilter,
  getStatusFilter,
  getTenantFilter,
  getDomainFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import { LLM_TYPE_OPTIONS } from '../llmTypeConfig'

export const filterOptions = {
  id: {
    label: i18n.t('table.title.id'),
  },
  name: getNameFilter(),
  status: getStatusFilter('sku'),
  llm_type: {
    label: i18n.t('aice.llm_type'),
    dropdown: true,
    items: LLM_TYPE_OPTIONS.map(opt => ({ key: opt.id, label: i18n.t(opt.name) })),
    filter: true,
    formatter: val => `llm_type.equals('${val}')`,
  },
  projects: getTenantFilter(),
  project_domains: getDomainFilter(),
  image: getNameFilter({ label: i18n.t('aice.image') }),
  llm_model_name: getNameFilter({ label: i18n.t('aice.model_name') }),
  created_at: getCreatedAtFilter(),
}
