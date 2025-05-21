
import * as R from 'ramda'
import i18n from '@/locales'

export const exportDataOptions = {
  title: i18n.t('compute.text_986'),
  resource: 'secgrouprules',
  items: [
    { label: i18n.t('compute.text_987'), key: 'id' },
    { label: i18n.t('compute.text_988'), key: 'secgroup' },
    { label: i18n.t('compute.text_989'), key: 'secgroup_id' },
    { label: i18n.t('compute.text_990'), key: 'direction' },
    { label: i18n.t('compute.text_694'), key: 'action' },
    { label: i18n.t('compute.text_980'), key: 'protocol' },
    { label: i18n.t('compute.text_349'), key: 'ports' },
    { label: i18n.t('compute.text_981'), key: 'priority' },
    { label: 'CIDR', key: 'cidr' },
    { label: i18n.t('dictionary.project'), key: 'tenant' },
    { label: i18n.t('compute.text_271'), key: 'user_tags' },
    { label: i18n.t('common.createdAt'), key: 'created_at' },
  ],
  transformParams (params) {
    if (params.filter) {
      params.filter = params.filter.map((item) => {
        if (item.includes('name.contains(')) {
          const val = /\((.+?)\)/.exec(item)[1]
          params.secgroup_name = val
          return ''
        }
        if (R.is(String, item) && item.startsWith('id.in(')) {
          return item.replace('id', 'secgroup_id')
        }
        if (R.is(Array, item) && item.some(k => R.is(String, k) && k.startsWith('id.in('))) {
          item = item.map(k => {
            if (R.is(String, k) && k.startsWith('id.in(')) {
              return k.replace('id', 'secgroup_id')
            }
            return k
          })
        }
        return item
      }).filter((item) => {
        return item
      })
    }
    return params
  },
}
