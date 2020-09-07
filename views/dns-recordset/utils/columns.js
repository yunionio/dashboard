import { policyParamsMap } from '../constants'
import i18n from '@/locales'

export const getDnsTypeTableColumns = () => {
  return {
    field: 'dns_type',
    title: i18n.t('network.text_160'),
  }
}

export const getDnsValueTableColumns = () => {
  return {
    field: 'dns_value',
    title: i18n.t('network.text_152'),
  }
}

export const getTtlTableColumns = () => {
  return {
    field: 'ttl',
    title: i18n.t('common_663'),
  }
}

export const getTrafficPoliciesTableColumns = () => {
  return {
    field: 'traffic_policies',
    title: i18n.t('common_695'),
    width: 220,
    type: 'expand',
    slots: {
      default: ({ row }) => {
        if (!row.traffic_policies) return i18n.t('common_701')
        return i18n.t('compute.text_798', [row.traffic_policies.length])
      },
      content: ({ row }, h) => {
        const trafficPolicieList = []
        const { traffic_policies } = row
        const generateContent = (item, idx) => {
          const con = []
          if (item.provider) {
            con.push(policyParamsMap.provider[item.provider])
          }
          if (item.policy_type) {
            con.push(policyParamsMap.policy_type[item.policy_type])
          }
          if (item.policy_value) {
            con.push(policyParamsMap.policy_value[item.policy_value])
          }
          return `${i18n.t('common_698')}${idx + 1}: ${con.join('/')}`
        }
        if (!traffic_policies || traffic_policies.length === 0) {
          trafficPolicieList.push(
            <div>{ i18n.t('common_700') }</div>,
          )
        } else {
          return traffic_policies.map((item, idx) => {
            return <a-tag color="pink">{ generateContent(item, idx) }</a-tag>
          })
        }
        return trafficPolicieList
      },
    },
  }
}
