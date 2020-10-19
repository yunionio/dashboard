<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import { levelColumn, strategyColumn } from '../utils'
import { levelMaps } from '@Monitor/constants'
import { getStatusTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { BRAND_MAP } from '@/constants'

export default {
  name: 'AlertrecordList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    alertId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'alertrecords',
        apiVersion: 'v1',
        getParams: {
          alert_id: this.alertId,
          scope: 'system', // 仅管理后台可以查看报警记录
        },
        filterOptions: {
          level: {
            label: this.$t('monitor.level'),
            dropdown: true,
            items: Object.values(levelMaps),
          },
          state: {
            label: this.$t('common.status'),
            dropdown: true,
            items: [
              { label: this.$t('status.alertrecord.ok'), key: 'ok' },
              { label: this.$t('status.alertrecord.alerting'), key: 'alerting' },
            ],
          },
        },
      }),
      columns: [
        {
          type: 'seq',
          title: '序号',
        },
        strategyColumn('alert_rule'),
        levelColumn,
        {
          field: 'res_num',
          title: this.$t('cloudenv.text_417'),
          type: 'expand',
          slots: {
            default: ({ row }) => {
              return row.res_num + this.$t('system.text_88')
            },
            content: ({ row }) => {
              const columns = [
                {
                  field: 'name',
                  title: this.$t('dashboard.text_110'),
                  formatter: ({ row }) => row.tags.name || '-',
                },
                {
                  field: 'ip',
                  title: 'IP',
                  formatter: ({ row }) => row.tags.ip || '-',
                },
                {
                  field: 'brand',
                  title: this.$t('compute.text_176'),
                  formatter: ({ row }) => {
                    let brand = row.tags.brand
                    if (!brand) return '-'
                    if (brand === 'kvm') brand = 'OneCloud'
                    return BRAND_MAP[brand].label || brand
                  },
                },
                {
                  field: 'value_str',
                  title: this.$t('monitor.text_16'),
                  align: 'right',
                  formatter: ({ row }) => row.value_str,
                },
              ]
              return <vxe-grid size="mini" border columns={columns} data={row.eval_data} />
            },
          },
        },
        getStatusTableColumn({ statusModule: 'alertrecord', field: 'state' }),
        getTimeTableColumn({ title: this.$t('monitor.text_14') }),
      ],
      singleActions: [
        {
          label: this.$t('cloudenv.text_463'),
          action: (obj) => {
            this.createDialog('ViewAlertrecordDetailDialog', {
              vm: this,
              data: [obj],
              alertData: this.data,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
