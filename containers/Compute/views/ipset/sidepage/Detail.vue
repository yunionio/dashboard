<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
const IPSET_TYPE = {
  ipv4_cidr_list: 'IPv4',
  ipv6_cidr_list: 'IPv6',
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
        {
          field: 'ipset_type',
          title: this.$t('compute.text_175'),
          formatter: ({ row }) => {
            return IPSET_TYPE[row.ipset_type] || row.ipset_type || '-'
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
                  const cidrList = row.data.split(',')
                  cidrList.forEach(item => {
                    ret.push(
                      <list-body-cell-wrap copy hideField={true} field='data' row={row} message={item}>
                        {item}
                      </list-body-cell-wrap>,
                    )
                  })
                  return ret
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
