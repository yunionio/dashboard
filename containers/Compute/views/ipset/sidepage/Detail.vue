<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="ipset" />
</template>

<script>
import { getBrandTableColumn, getAccountTableColumn, getRegionTableColumn } from '@/utils/common/tableColumn'

const IPSET_TYPE = {
  ipv4_cidr_list: 'IPv4',
  ipv6_cidr_list: 'IPv6',
}

function parseCidrList (data) {
  if (Array.isArray(data)) {
    return data.map(item => String(item).trim()).filter(Boolean)
  }
  if (!data) return []
  return String(data).split(/[,\n]/).map(item => item.trim()).filter(Boolean)
}

export default {
  name: 'IpSetDetail',
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
        getAccountTableColumn(),
        getRegionTableColumn(),
        {
          field: 'ip_set_type',
          title: this.$t('compute.text_175'),
          formatter: ({ row }) => {
            return IPSET_TYPE[row.ip_set_type] || row.ip_set_type || '-'
          },
        },
        {
          field: 'security_group_count',
          title: this.$t('compute.text_105'),
          formatter: ({ row }) => {
            return row.security_group_count
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('compute.text_352'),
          items: [
            {
              field: 'data',
              title: 'CIDR',
              slots: {
                default: ({ row }, h) => {
                  const ret = []
                  const cidrList = parseCidrList(row.data)
                  cidrList.forEach(item => {
                    ret.push(
                      <list-body-cell-wrap copy hideField={true} field='data' row={row} message={item}>
                        {item}
                      </list-body-cell-wrap>,
                    )
                  })
                  return ret.length ? ret : '-'
                },
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
