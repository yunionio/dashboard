import i18n from '@/locales'
import { policyParamsMap } from '../constants'
import { getAliyunEEPolicyValuePath } from './index'

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
    title: i18n.t('common_665'),
  }
}

export const getTrafficPoliciesTableColumns = (isAliyunEE) => {
  return {
    field: 'traffic_policies',
    title: i18n.t('common_696'),
    width: 220,
    slots: {
      default: ({ row }, h) => {
        if (row.cloud_env === 'onpremise') return '-'
        const trafficPolicieList = []
        const generateContent = (item, idx) => {
          const con = []
          if (item.policy_type) {
            con.push(policyParamsMap.policy_type[item.policy_type])
          }
          if (item.policy_value) {
            if (isAliyunEE) {
              const val = getAliyunEEPolicyValuePath(item.policy_type, item.policy_value)
              con.push(val.label || policyParamsMap.policy_value[item.policy_value] || item.policy_value)
            } else {
              con.push(policyParamsMap.policy_value[item.policy_value] || item.policy_value)
            }
          }
          return con.join('/')
        }
        if (!row.policy_type) {
          trafficPolicieList.push(
            <div>{i18n.t('common_700')}</div>,
          )
        } else {
          return [<a-tag color="pink">{generateContent(row)}</a-tag>]
        }
        return trafficPolicieList
      },
    },
    formatter: ({ row }) => {
      if (row.cloud_env === 'onpremise') return '-'
      const generateContent = (item, idx) => {
        const con = []
        if (item.policy_type) {
          con.push(policyParamsMap.policy_type[item.policy_type])
        }
        if (item.policy_value) {
          con.push(policyParamsMap.policy_value[item.policy_value] || item.policy_value)
        }
        return con.join('/')
      }
      if (!row.policy_type) {
        return i18n.t('common_700')
      } else {
        return generateContent(row)
      }
    },
  }
}
