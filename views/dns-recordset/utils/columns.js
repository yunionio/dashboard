import { policyParamsMap } from '../constants'

export const getDnsTypeTableColumns = () => {
  return {
    field: 'dns_type',
    title: '记录类型',
  }
}

export const getDnsValueTableColumns = () => {
  return {
    field: 'dns_value',
    title: '记录值',
  }
}

export const getTtlTableColumns = () => {
  return {
    field: 'ttl',
    title: 'TTL(秒)',
  }
}

export const getTrafficPoliciesTableColumns = () => {
  return {
    field: 'traffic_policies',
    title: '解析线路',
    width: 220,
    type: 'expand',
    slots: {
      default: ({ row }) => {
        if (!row.traffic_policies) return '0条'
        return `${row.traffic_policies.length}条`
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
          return `线路${idx + 1}: ${con.join('/')}`
        }
        if (!traffic_policies || traffic_policies.length === 0) {
          trafficPolicieList.push(
            <div>暂无解析线路</div>,
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
