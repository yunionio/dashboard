<template>
  <div>
    <div class="detail-title">{{$t('network.text_501')}}</div>
    <vxe-grid :data="listData" :columns="columns">
      <span slot="empty">{{isRedirect ? $t('network.text_502') : $t('network.text_503')}}</span>
    </vxe-grid>
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
          title: this.$t('network.text_504'),
          formatter: ({ row }) => {
            return `${row.name}（${row.address}:${row.port}）`
          },
        },
        {
          field: 'check_status',
          title: this.$t('network.text_27'),
          slots: {
            default: ({ row }, h) => {
              if (!row.check_status) return '-'
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
          title: this.$t('network.text_505'),
          formatter: ({ row }) => row.check_code || '-',
        },
        {
          field: 'weight',
          title: this.$t('network.text_166'),
        },
        {
          field: 'time',
          title: this.$t('network.text_314'),
          formatter: ({ row }) => this.$moment(row.updated_at).format(),
        },
      ],
    }
  },
  computed: {
    isRedirect () {
      return this.data.redirect === 'raw'
    },
  },
  watch: {
    'data.id' () {
      this.fetchData()
    },
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      if (this.isRedirect) {
        this.listData = []
        return false
      }
      try {
        const isRule = this.data.type === 2
        let manager = new this.$Manager('loadbalancerlisteners')
        if (isRule) {
          manager = new this.$Manager('loadbalancerlistenerrules')
        }
        const { data } = await manager.getSpecific({ id: this.data.id, spec: 'backend-status' })
        this.listData = data
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
