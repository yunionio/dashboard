<template>
  <div>
    <div class="detail-title">后端健康状态</div>
    <vxe-grid :data="listData" :columns="columns" />
  </div>
</template>

<script>
import { CEHCK_STATUS_CN } from './constants'

export default {
  name: 'LblistenerDashboard',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      listData: [],
      columns: [
        {
          field: 'svname',
          title: '后端服务器组 (IP:端口)',
          formatter: ({ row }) => {
            return `${row.name}（${row.address}:${row.port}）`
          },
        },
        {
          field: 'check_status',
          title: '状态',
          slots: {
            default: ({ row }, h) => {
              if (CEHCK_STATUS_CN[row.check_status]) {
                return [h('span', {
                  style: {
                    color: CEHCK_STATUS_CN[row.check_status].textColor,
                  },
                }, CEHCK_STATUS_CN[row.check_status].text)]
              }
              for (const k in CEHCK_STATUS_CN) {
                const item = CEHCK_STATUS_CN[k]
                if (row.check_status.includes(k)) {
                  return [h('span', {
                    style: {
                      color: item.textColor,
                    },
                  }, row.check_status.replace(k, item))]
                }
              }
              return [row.check_status]
            },
          },
        },
        {
          field: 'check_code',
          title: '状态码',
          formatter: ({ row }) => row.check_code || '-',
        },
        {
          field: 'weight',
          title: '权重',
        },
        {
          field: 'time',
          title: '更新时间',
          formatter: ({ row }) => this.$moment(row.updated_at).format(),
        },
      ],
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        const { data } = await new this.$Manager('loadbalancerlisteners').getSpecific({ id: this.data.id, spec: 'backend-status' })
        this.listData = data
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
