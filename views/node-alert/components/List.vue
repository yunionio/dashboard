<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { metricItems, TIME_CN, LEVEL_CN, channelMap } from '@Compute/views/node-alert/constants'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { HYPERVISORS_MAP } from '@/constants'
import { sizestr, splitUnit } from '@/utils/utils'

export default {
  name: 'NodeAlertList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
    isSidepage: { // 是否在抽屉里面
      type: Boolean,
      default: true,
    },
    data: { // 抽屉里面当前 list row 的数据
      type: Object,
    },
    alertType: {
      type: String,
      required: true,
      validator: val => ['guest', 'host'].includes(val),
    },
    metricOpts: {
      type: Array,
      required: true,
    },
    listId: {
      type: String,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'nodealerts',
        apiVersion: 'v1',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'metric',
          title: this.$t('compute.text_744'),
          width: '24%',
          formatter: ({ row }) => {
            if (!row.metric) return '-'
            if (!metricItems[row.metric]) return row.metric
            return metricItems[row.metric].label
          },
        },
        {
          field: 'window',
          title: this.$t('compute.text_733'),
          width: 80,
          formatter: ({ row }) => {
            if (!row.window) return '-'
            const window = row.window.slice(0, -1)
            const unit = row.window.slice(-1)
            const cn = TIME_CN[unit] || unit
            return `${window} ${cn}`
          },
        },
        {
          field: 'comparator',
          title: this.$t('compute.text_745'),
        },
        {
          field: 'threshold',
          title: this.$t('compute.text_736'),
          formatter: ({ row }) => {
            if (!row.metric) return '-'
            const { unit } = metricItems[row.metric]
            let threshold = row.threshold
            if (unit === 'bps') {
              threshold = sizestr(threshold, 'B', 1000)
            }
            const text = `${threshold}${unit}`
            if (text) return splitUnit(text).text
            else return '-'
          },
        },
        {
          field: 'level',
          title: this.$t('compute.text_746'),
          slots: {
            default: ({ row }) => {
              const levelItem = LEVEL_CN[row.level]
              if (!levelItem) return row.level || '-'
              return [
                <a-tag color={levelItem.color}>{ levelItem.label }</a-tag>,
              ]
            },
          },
        },
        {
          field: 'channel',
          title: this.$t('compute.text_739'),
          width: 80,
          formatter: ({ row }) => {
            return channelMap[row.channel] || row.channel
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.text_18'),
          action: () => {
            this.createDialog('CreateNodeAlert', {
              list: this.list,
              alertType: this.alertType,
              nodeId: this.data.id,
              metricOpts: this.metricOpts,
              hypervisor: this.data.hypervisor,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
              buttonType: 'primary',
            }
            if (this.isSidepage) {
              const { hypervisor } = this.data
              if (hypervisor === HYPERVISORS_MAP.esxi.key) { // esxi 允许新建6个报警
                ret.validate = this.list.total < 6
              }
              ret.validate = this.list.total < 5 // 默认允许新建5个报警
            }
            return ret
          },
        },
        {
          label: this.$t('compute.text_261'),
          permission: 'server_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_747'),
              name: this.$t('compute.text_748'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_749'),
          action: obj => {
            this.createDialog('UpdateNodeAlert', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              alertType: this.alertType,
              metricOpts: this.metricOpts,
              hypervisor: this.data.hypervisor,
            })
          },
        },
        {
          label: this.$t('compute.text_261'),
          permission: 'server_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.text_747'),
              name: this.$t('compute.text_748'),
              onManager: this.onManager,
            })
          },
          // meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
