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
  image_name: {
    label: i18n.t('aice.llm_image.url'),
    filter: true,
    formatter: val => `image_name.contains('${val}')`,
  },
  image_source: {
    label: i18n.t('aice.llm_image.image_source'),
    dropdown: true,
    items: [
      { label: i18n.t('dictionary.container_image'), key: 'container_image' },
      { label: i18n.t('aice.llm_image.image_source.manual'), key: 'manual' },
    ],
  },
  status: getStatusFilter('desktopImage'),
  projects: getTenantFilter(),
  project_domains: getDomainFilter(),
  created_at: getCreatedAtFilter(),
}
