<template>
  <div>
    <monitor-header
      v-if="isTemplate && isTemplateEdit"
      :time.sync="time"
      :showCustomTime="false"
      :showGroupFunc="false"
      :showTimegroup="false"
      @refresh="refresh" />
    <page-list
      :list="list"
      :columns="templateListColumns || columns"
      :single-actions="singleActions"
      :group-actions="groupActions"
      :export-data-options="exportDataOptions"
      :showGroupActions="showGroupActions"
      :showSearchbox="showSearchbox"
      :show-single-actions="!isTemplate"
      :show-page="!isTemplate" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { levelMaps } from '@Monitor/constants'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import BrandIcon from '@/sections/BrandIcon'
import { getNameFilter, getTimeRangeFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import { getTimeTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { strategyColumn, levelColumn, getStrategyInfo } from '@Monitor/views/commonalert/utils'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import MonitorHeader from '@/sections/Monitor/Header'
import ColumnsMixin from '../mixins/columns'
import SingleAction from '../mixins/singleActions'

export default {
  name: 'AlertResourceList',
  components: {
    MonitorHeader,
  },
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleAction, ResTemplateListMixin],
  props: {
    id: String,
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
    templateParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, this.listOptions('monitorresourcealerts')),
      resTypeItems: [],
      time: this.templateParams.time || '168h',
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
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('monitor.text_17'),
        items: this.columns,
        hiddenFields: ['ip', 'value_str', 'brand', 'alert_details'],
        fixedItems: [
          { key: 'data.tags.ip', label: 'IP' },
          { key: 'data.value_str', label: this.$t('monitor.text_16') },
          { key: 'data.tags.brand', label: this.$t('compute.text_176') },
          { key: 'data.alert_details', label: this.$t('monitor.condition') },
        ],
      }
    },
  },
  watch: {
    time (val) {
      this.list.fetchData()
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
        description: getDescriptionFilter(),
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
        ip: { label: 'IP' },
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
        id: this.id || this.listId,
        idKey: 'row_id',
        resource: resource,
        apiVersion: 'v1',
        getParams: this.getParam,
        genParamsCb: (params) => { return Object.assign({}, params, { details: true }) },
        filter: this.resType ? { res_type: [this.resType] } : {},
        filterOptions: this.filters(),
        hiddenColumns: ['alert_rule'],
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
      }
    },
    listColumns () {
      return [
        getNameDescriptionTableColumn({
          edit: false,
          showDesc: false,
          editDesc: false,
          title: this.$t('common_151'),
          hideField: true,
          field: 'res_name',
          onManager: this.onManager,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.res_name }</side-page-trigger>
            )
          },
        }),
        getTimeTableColumn({ field: 'trigger_time', title: this.$t('monitor.text_14') }),
        getStatusTableColumn({ statusModule: 'alertrecord', field: 'alert_state' }),
        {
          field: 'res_type',
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
        {
          field: 'alert_details',
          title: this.$t('monitor.condition'),
          formatter: ({ row }) => {
            const { strategy } = getStrategyInfo(row.data.alert_details || (row.alert_rule && row.alert_rule.length && row.alert_rule[0]))
            return strategy
          },
        },
        levelColumn,
        getCopyWithContentTableColumn({
          field: 'ip',
          title: 'IP',
          hideField: true,
          message: row => row.data?.tags?.ip || '-',
          formatter: ({ row }) => {
            return row.data?.tags?.ip || ''
          },
          slotCallback: (row) => {
            return row.data?.tags?.ip || '-'
          },
        }),
        {
          field: 'alert_name',
          title: this.$t('monitor.text_99'),
          formatter: ({ row }) => row.alert_name || '-',
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
                <BrandIcon name={brand} />,
              ]
            },
          },
          formatter: ({ row }) => {
            let brand = R.path(['data', 'tags', 'brand'], row)
            if (!brand) return ''
            if (brand === 'kvm') brand = 'OneCloud'
            return brand
          },
        },
        {
          field: 'value_str',
          title: this.$t('monitor.text_16'),
          align: 'right',
          formatter: ({ row }) => row.data ? row.data.value_str : '-',
        },
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
        alerting: true,
      }
      if (this.isTemplate && this.time) {
        if (this.time.includes('h')) {
          ret.start_time = this.$moment().utc().subtract(this.time.replace('h', ''), 'hours').format('YYYY-MM-DD HH:mm:ss')
          ret.end_time = this.$moment().utc().format('YYYY-MM-DD HH:mm:ss')
        } else if (this.time === 'last_month') {
          ret.start_time = this.$moment().utc().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss')
          ret.end_time = this.$moment().utc().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')
        }
      }
      return ret
    },
    handleOpenSidepage (row) {
      const { tags = {} } = row.data || {}
      const data = { ...tags }
      data.id = row.monitor_resource_id
      data.ip = data.ip || data.vm_ip
      this.sidePageTriggerHandle(this, 'AlertResourceSidePage', {
        id: row.res_id,
        resource: () => {
          return {
            data,
          }
        },
        getParams: this.getParam,
        alert_id: row.alert_id,
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
