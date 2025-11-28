<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions">
    <template v-slot:group-actions-append>
      <a-radio-group class="ml-3" v-model="time">
        <a-radio-button value="1">{{ $t('common_167') }}</a-radio-button>
        <a-radio-button value="6">{{ $t('common_nearly_num_hours', [6]) }}</a-radio-button>
        <a-radio-button value="12">{{ $t('common_nearly_num_hours', [12]) }}</a-radio-button>
        <a-radio-button value="24">{{ $t('common_nearly_num_hours', [24]) }}</a-radio-button>
        <a-radio-button value="168">{{ $t('common_174') }}</a-radio-button>
        <a-radio-button value="720">{{ $t('common_175') }}</a-radio-button>
        <a-radio-button value="all">{{ $t('monitor.text_3') }}</a-radio-button>
      </a-radio-group>
    </template>
  </page-list>
</template>

<script>
import * as R from 'ramda'
import { levelMaps } from '@Monitor/constants'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import BrandIcon from '@/sections/BrandIcon'
import storage from '@/utils/storage'
import { getNameFilter, getTimeRangeFilter, getStatusFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import { getTimeTableColumn, getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { strategyColumn, levelColumn, getStrategyInfo } from '@Monitor/views/commonalert/utils'
import ColumnsMixin from '../mixins/columns'

const STORAGE_TIME_KEY = '__oc_alertrecord_time__'

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
    resType: String,
    listId: String,
    hiddenColumns: {
      type: Array,
      default: () => [],
    },
    hideAlertRecordResourceCount: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const timeConfig = storage.get(STORAGE_TIME_KEY, {})
    return {
      list: this.$list.createList(this, this.listOptions('alertrecords')),
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
      time: timeConfig.time || '168',
    }
  },
  computed: {
    columns () {
      let columns = this.listColumns()
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
            this.createDialog('ViewAlertrecordDetailDialog', {
              vm: this,
              columns: this.columns,
              onManager: this.onManager,
              data: [obj],
            })
          },
        },
      ]
      return actions
    },
  },
  watch: {
    resTypeItems (val) {
      this.$nextTick(() => {
        this.list.filterOptions = this.filters()
      })
    },
    time (val) {
      storage.set(STORAGE_TIME_KEY, { time: val })
      this.list.fetchData()
    },
  },
  created () {
    this.allAlertManager = new this.$Manager('alertrecords', 'v1')
    this.initResType()
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    getStatusTableFilter () {
      return [getStatusFilter({ field: 'state', statusModule: 'alertrecord' })]
    },
    filters () {
      const options = {
        name: getNameFilter({ field: 'name', label: this.$t('monitor.text_99') }),
        description: getDescriptionFilter(),
        level: {
          label: this.$t('monitor.level'),
          dropdown: true,
          items: Object.values(levelMaps),
        },
        ...this.getStatusTableFilter(),
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
        idKey: 'id',
        resource: resource,
        apiVersion: 'v1',
        getParams: this.getParam,
        genParamsCb: (params) => { return Object.assign({}, params, { details: true }) },
        filterOptions: this.filters(),
      }
    },
    listColumns () {
      return [
        getNameDescriptionTableColumn({
          edit: false,
          title: this.$t('monitor.text_99'),
          hideField: true,
          field: 'alert_name',
          onManager: this.onManager,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.alert_name}</side-page-trigger>
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
            let rule = row.alert_rule
            if (R.is(Array, rule)) {
              rule = row.alert_rule[0]
            }
            if (rule && rule.res_type) {
              if (this.$te(`dictionary.${rule.res_type}`)) {
                return this.$t(`dictionary.${rule.res_type}`)
              }
            }
            return '-'
          },
        },
        strategyColumn('alert_rule'),
        levelColumn,
        ...(this.hideAlertRecordResourceCount ? [] : [
          {
            field: 'res_num',
            title: this.$t('cloudenv.text_417'),
            minWidth: 80,
            slots: {
              default: ({ row }) => {
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
                          <BrandIcon name={brand} />,
                        ]
                      },
                    },
                  },
                  {
                    field: 'condition',
                    title: this.$t('monitor.condition'),
                    slots: {
                      default: ({ row }, h) => {
                        if (!row.alert_details) return '-'
                        const { strategy } = getStrategyInfo(row.alert_details)

                        return [
                          <a-tooltip>
                            <template slot="title">
                              {row.metric}
                            </template>
                            {strategy}
                          </a-tooltip>,
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
                return [<list-body-cell-popover text={this.$t('common_701', [row.res_num || 0])} min-width="700px">
                  <vxe-grid size="mini" border showOverflow={false} row-config={{ isHover: true }} column-config={{ resizable: false }} columns={columns} data={row.eval_data} />
                </list-body-cell-popover>]
              },
            },
          },
        ]),
        {
          field: 'send_state',
          title: this.$t('common.sendState'),
          sortable: true,
          formatter: ({ row }) => this.$t(`status.alertSendState.${row.send_state}`),
        },
      ]
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
      }
      if (this.time !== 'all') {
        const f = `created_at.gt("${this.$moment().utc().subtract(this.time, 'hours').format('YYYY-MM-DD HH:mm:ss')}")`
        if (ret.filter) {
          if (R.is(Array, ret.filter)) {
            ret.filter.push(f)
          } else {
            ret.filter = [f]
          }
        } else {
          ret.filter = [f]
        }
      }
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
