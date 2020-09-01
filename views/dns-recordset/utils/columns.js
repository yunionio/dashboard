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
        return `${row.traffic_policies.length}条`
      },
      content: ({ row }, h) => {
        const trafficPolicieList = []
        const { traffic_policies } = row
        const generateContent = (item) => {
          return `${item.provider}: ${item.policy_type}`
        }
        if (traffic_policies.length === 0) {
          trafficPolicieList.push(
            <div>暂无解析线路</div>,
          )
        } else {
          return traffic_policies.map((item) => {
            return <a-tag color="pink">{ generateContent(item) }</a-tag>
          })
        }
        return trafficPolicieList
      },
    },
  }
}
