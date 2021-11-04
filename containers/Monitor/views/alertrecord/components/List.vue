<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import { levelMaps } from '@Monitor/constants'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import BrandIcon from '@/sections/BrandIcon'
import { getNameFilter, getTimeRangeFilter } from '@/utils/common/tableFilter'
import { getTimeTableColumn, getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { strategyColumn, levelColumn } from '@Monitor/views/commonalert/utils'

export default {
  name: 'AlertrecordList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
    data: {
      type: Object,
      required: false,
    },
    alertType: String,
    resType: String,
    listId: String,
    hiddenColumns: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      allList: this.$list.createList(this, this.listOptions('alertrecords')),
      unrecoverList: this.$list.createList(this, this.listOptions('monitorresourcealerts')),
      exportDataOptions: {
        items: [
          { key: 'alert_name', label: this.$t('monitor.text_99') },
          { key: 'created_at', label: this.$t('monitor.text_14') },
          { key: 'state', label: this.$t('common.status') },
          { key: 'res_type', label: this.$t('monitor.text_97') },
          { key: 'alert_rule', label: this.$t('monitor.strategy_detail') },
          { key: 'level', label: this.$t('monitor.level') },
          { key: 'res_num', label: this.$t('cloudenv.text_417') },
          { key: 'send_state', label: this.$t('common.sendState') },
        ].filter(item => {
          return !this.hiddenColumns.some(item2 => item2 === item.key)
        }),
      },
      resTypeItems: [],
    }
  },
  computed: {
    list () {
      if (this.alertType === 'un-recovered') {
        return this.unrecoverList
      } else {
        return this.allList
      }
    },
    columns () {
      let columns = this.listColumns(this.alertType)
      if (this.hiddenColumns.length) {
        columns = columns.filter(item => {
          return !this.hiddenColumns.some(item2 => item2 === item.field)
        })
      }
      return columns
    },
    singleActions () {
      const actions = [
        {
          label: this.$t('cloudenv.text_463'),
          action: (obj) => {
            if (this.alertType === 'un-recovered' && obj.data) {
              obj.eval_data = [obj.data]
            }
            this.createDialog('ViewAlertrecordDetailDialog', {
              vm: this,
              columns: this.columns,
              onManager: this.onManager,
              data: [obj],
            })
          },
        },
      ]

      if (this.alertType === 'un-recovered') {
        actions.push({
          label: this.$t('monitor.alerts.shield.shield'),
          action: (obj) => {
            this.createDialog('ShieldAlertrecord', {
              vm: this,
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
              data: [obj],
            })
          },
          meta: (obj) => {
            const ret = {
              validate: true,
            }
            // if (obj.send_state === 'shield') {
            //   return {
            //     validate: false,
            //     tooltip: this.$t('monitor.alerts.shield.tips'),
            //   }
            // }
            if (obj.is_set_shield === true) {
              return {
                validate: false,
                tooltip: this.$t('monitor.alerts.shield.tips2'),
              }
            }
            return ret
          },
        })
      }
      return actions
    },
  },
  watch: {
    alertType (val) {
      this.$nextTick(() => {
        this.list.fetchData()
        if (this.resTypeItems.length) this.list.filterOptions = this.filters()
      })
    },
    resTypeItems (val) {
      this.$nextTick(() => {
        this.list.filterOptions = this.filters()
      })
    },
  },
  created () {
    this.allAlertManager = new this.$Manager('alertrecords', 'v1')
    this.list.fetchData()
    this.initResType()
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    filters () {
      const options = {
        name: getNameFilter({ field: 'name', label: this.$t('monitor.text_99') }),
        level: {
          label: this.$t('monitor.level'),
          dropdown: true,
          items: Object.values(levelMaps),
        },
        send_state: {
          label: this.$t('common.sendState'),
          dropdown: true,
          filter: true,
          items: [
            { key: 'ok', label: this.$t('status.alertSendState.ok') },
            { key: 'silent', label: this.$t('status.alertSendState.silent') },
            { key: 'shield', label: this.$t('status.alertSendState.shield') },
          ],
          formatter: (val) => {
            return `send_state.equals(${val})`
          },
        },
        res_type: {
          label: this.$t('monitor.text_97'),
          dropdown: true,
          items: this.resTypeItems,
        },
        res_name: {
          field: 'res_name',
          label: this.$t('common_151'),
        },
        created_at: getTimeRangeFilter({ label: this.$t('monitor.text_14'), field: 'trigger_time' }),
      }
      for (const key of Object.keys(options)) {
        if (this.hiddenColumns.some(item => item === key)) {
          delete options[key]
        }
      }
      return options
    },
    listOptions (resource) {
      return {
        id: this.listId,
        idKey: resource === 'monitorresourcealerts' ? 'row_id' : 'id',
        resource: resource,
        apiVersion: 'v1',
        getParams: this.getParam,
        genParamsCb: (params) => { return Object.assign({}, params, { details: true }) },
        filter: this.resType ? { res_type: [this.resType] } : {},
        filterOptions: this.filters(),
      }
    },
    resourceColumns (alertType) {
      if (alertType === 'un-recovered') {
        return [
          {
            field: 'name',
            title: this.$t('common_151'),
            formatter: ({ row }) => R.path(['data', 'tags', 'name'], row) || '-',
          },
          {
            field: 'brand',
            title: this.$t('compute.text_176'),
            slots: {
              default: ({ row }, h) => {
                let brand = R.path(['data', 'tags', 'brand'], row)
                if (!brand) return [<data-loading />]
                if (brand === 'kvm') brand = 'OneCloud'
                return [
                  <BrandIcon name={ brand } />,
                ]
              },
            },
          },
          {
            field: 'value_str',
            title: this.$t('monitor.text_16'),
            align: 'right',
            formatter: ({ row }) => row.data ? row.data.value_str : '-',
          },
        ]
      } else {
        return [
          {
            field: 'res_num',
            title: this.$t('cloudenv.text_417'),
            minWidth: 80,
            type: 'expand',
            slots: {
              default: ({ row }) => {
                return row.res_num
              },
              content: ({ row }) => {
                const columns = [
                  {
                    field: 'name',
                    title: this.$t('dashboard.text_110'),
                    formatter: ({ row }) => R.path(['tags', 'name'], row) || '-',
                  },
                  {
                    field: 'ip',
                    title: 'IP',
                    formatter: ({ row }) => R.path(['tags', 'ip'], row) || '-',
                  },
                  {
                    field: 'brand',
                    title: this.$t('compute.text_176'),
                    slots: {
                      default: ({ row }, h) => {
                        let brand = R.path(['tags', 'brand'], row)
                        if (!brand) return [<data-loading />]
                        if (brand === 'kvm') brand = 'OneCloud'
                        return [
                          <BrandIcon name={ brand } />,
                        ]
                      },
                    },
                  },
                  {
                    field: 'value_str',
                    title: row.state === 'ok' ? this.$t('monitor.text_106') : this.$t('monitor.text_105'),
                    align: 'right',
                    formatter: ({ row }) => row.value_str,
                  },
                ]
                return <vxe-grid size="mini" border columns={columns} data={row.eval_data} />
              },
            },
          }]
      }
    },
    listColumns (alertType) {
      return [
        getNameDescriptionTableColumn({
          edit: false,
          title: this.$t('monitor.text_99'),
          hideField: true,
          field: 'alert_name',
          onManager: this.onManager,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.alert_name }</side-page-trigger>
            )
          },
        }),
        getTimeTableColumn({ field: 'trigger_time', title: this.$t('monitor.text_14') }),
        getStatusTableColumn({ statusModule: 'alertrecord', field: 'state' }),
        {
          field: 'type',
          title: this.$t('monitor.text_97'),
          minWidth: 80,
          formatter: ({ row }) => {
            if (row.alert_rule && row.alert_rule.res_type) {
              if (this.$te(`dictionary.${row.alert_rule.res_type}`)) {
                return this.$t(`dictionary.${row.alert_rule.res_type}`)
              }
            }
            return '-'
          },
        },
        strategyColumn('alert_rule'),
        levelColumn,
        ...this.resourceColumns(alertType),
        {
          field: 'send_state',
          title: this.$t('common.sendState'),
          formatter: ({ row }) => this.$t(`status.alertSendState.${row.send_state}`),
        },
      ]
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
      }
      if (this.alertType === 'un-recovered') ret.alertinng = true
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CommonalertsSidePage', {
        id: row.alert_id,
        resource: 'commonalerts',
        apiVersion: 'v1',
        getParams: this.getParam,
      })
    },
    initResType () {
      this.allAlertManager.get({
        id: 'distinct-field',
        params: {
          scope: this.$store.getters.scope,
          extra_field: 'res_type',
          details: true,
        },
      }).then(res => {
        const { res_type = [] } = res.data || {}
        this.resTypeItems = res_type.map(item => {
          let label = item
          if (this.$te(`dictionary.${item}`)) {
            label = this.$t(`dictionary.${item}`)
          }
          return {
            key: item,
            label,
          }
        })
      })
    },
  },
}
</script>
