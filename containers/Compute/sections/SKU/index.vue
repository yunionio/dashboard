<template>
  <div>
    <div style="display: flex;justify-content: space-between;" class="mb-1 mt-1">
      <a-radio-group v-model="skuType" @change="skuTypeChange">
        <a-radio-button
          v-for="item of skuInfo.categoryOptions"
          :value="item.key"
          :key="item.key"
          :disabled="item.disabled">{{ item.label }}</a-radio-button>
      </a-radio-group>
      <a-popover
        v-model="columnSettingVisible"
        placement="bottomRight"
        trigger="click"
        overlay-class-name="sku-column-setting-popover">
        <template slot="content">
          <a-checkbox-group v-model="visibleColumnFields" class="sku-column-setting">
            <div
              v-for="col in configurableColumns"
              :key="col.field"
              class="sku-column-setting-item">
              <a-checkbox :value="col.field">{{ col.title }}</a-checkbox>
            </div>
          </a-checkbox-group>
        </template>
        <a-tooltip :title="$t('common.text00011')">
          <a-button class="ml-2">
            <icon type="setting" />
          </a-button>
        </a-tooltip>
      </a-popover>
    </div>
    <vxe-grid
      row-id="id"
      ref="tableRef"
      min-height="260"
      resizable
      :columns="tableShowColumns"
      :data="skuResults"
      :sort-config="tableSortConfig"
      :radio-config="radioConfig"
      @sort-change="skuSortChangeHandle"
      @cell-click="skuChange"
      @radio-change="skuChange">
      <template v-slot:empty>
        <loader :loading="skuLoading || !canSkuShow" />
      </template>
    </vxe-grid>
    <div class="sku-pagebar">
      <vxe-pager
        :current-page.sync="skuPage.currentPage"
        :page-size.sync="skuPage.pageSize"
        :total="skuPage.totalResult"
        :layouts="['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Total']"
        @page-change="skuPageChangeHandle" />
      <div class="mt-1" v-if="selectedTip">{{$t('compute.text_171', [ selectedTip ])}}</div>
    </div>
    <div class="mt-1" v-if="unfindTip" style="color: red;">{{$t('compute.sku_unfind_tip', [ unfindTip ])}}</div>
    <div class="mt-1" v-if="disableSkuType && !supportSkuTypes.length" style="color: red;">{{dataList.length > 1 ? $t('compute.disable_sku_type_tip_2') : $t('compute.disable_sku_type_tip')}}</div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { ALL_SKU_CATEGORY_OPT, SKU_CATEGORY_MAP } from '@Compute/constants'
import { Manager } from '@/utils/manager'
import { PROVIDER_MAP } from '@/constants'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import storage from '@/utils/storage'
import RegionalAvailabilityPopover from '@/sections/RegionalAvailabilityPopover'

const SKU_HIDDEN_COLUMNS_KEY = '__oc_sku_hidden_columns'
const DEFAULT_HIDDEN_COLUMNS = ['cpu_model', 'nic_bandwidth', 'disk_performance']
const SKU_FILTERABLE_FIELDS = ['cpu_arch', 'name', 'cpu_model', 'nic_bandwidth', 'disk_performance']
const SKU_SELECT_FILTER_FIELDS = ['cpu_arch']

const escapeSkuFilterValue = (val = '') => String(val).replace(/"/g, '\\"')

const buildSkuColumnFilterExpr = (field, val = '') => {
  const value = escapeSkuFilterValue(val.trim())
  if (!value) return ''
  if (SKU_SELECT_FILTER_FIELDS.includes(field)) {
    return `${field}.equals("${value}")`
  }
  return `${field}.contains("${value}")`
}

const isSkuColumnFilterExpr = (filter = '') => {
  const expr = String(filter)
  return SKU_FILTERABLE_FIELDS.some(field => {
    if (SKU_SELECT_FILTER_FIELDS.includes(field)) {
      return expr.startsWith(`${field}.equals(`)
    }
    return expr.startsWith(`${field}.contains(`)
  })
}

const createSkuColumnFilterState = () => SKU_FILTERABLE_FIELDS.reduce((ret, field) => {
  ret[field] = ''
  return ret
}, {})

const createSkuColumnFilterVisibleState = () => SKU_FILTERABLE_FIELDS.reduce((ret, field) => {
  ret[field] = false
  return ret
}, {})

const sanitizeSkuParams = (params = {}) => {
  const ret = { ...params }
  if (ret.cpu_core_count === 0) {
    delete ret.cpu_core_count
  }
  if (ret.memory_size_mb === 0) {
    delete ret.memory_size_mb
  }
  delete ret.limit
  delete ret.offset
  delete ret['@local_category']
  if (ret.filter) {
    const items = (Array.isArray(ret.filter) ? ret.filter : [ret.filter])
      .filter(item => !isSkuColumnFilterExpr(item))
    if (items.length) {
      ret.filter = items
    } else {
      delete ret.filter
    }
  }
  return ret
}

const keys = ['hour_price', 'month_price', 'year_price']
const units = [i18n.t('compute.text_172'), i18n.t('compute.text_173'), i18n.t('compute.text_174')]

export default {
  name: 'SKU',
  props: {
    billType: {
      type: String,
    },
    hypervisor: {
      validator: val => {
        if (val) return R.is(String, val)
        return true
      },
    },
    value: { // v-decorator 的props
      required: true,
    },
    priceUnit: {
      type: Object,
      validator: val => {
        if (!R.isNil(val.key) || !R.isNil(val.unit)) {
          return keys.includes(val.key) && units.includes(val.unit)
        }
        return false
      },
      default: () => ({
        key: 'hour_price',
        unit: i18n.t('compute.text_172'),
      }),
    },
    skuParams: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      required: true,
      validator: val => ['idc', 'private', 'public'].includes(val),
    },
    hasMeterService: {
      type: Boolean,
      default: true,
    },
    instanceType: {
      type: String,
    },
    requireSysDiskType: {
      type: Array,
    },
    requireDataDiskTypes: {
      type: Array,
    },
    skuFilter: {
      type: Function,
      default: (items) => { return items },
    },
    canSkuShow: {
      type: Boolean,
      default: () => true,
    },
    skuDisabled: {
      type: Boolean,
      default: () => false,
    },
    dataSku: {
      type: Object,
      default: () => ({}),
    },
    isAdjustConfig: {
      type: Boolean,
      default: () => false,
    },
    dataList: {
      type: Array,
      default: () => [],
    },
    initSkuData: {
      type: Object,
      default: () => ({}),
    },
    supportSkuTypes: {
      type: Array,
      default: () => [],
    },
    disableSkuType: {
      type: Boolean,
      default: () => false,
    },
  },
  data () {
    const stored = storage.get(SKU_HIDDEN_COLUMNS_KEY)
    return {
      skuList: [], // 套餐列表
      skuLoading: false,
      selectedSkuData: {},
      skuType: ALL_SKU_CATEGORY_OPT.key,
      skuPage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      skuSort: {
        order_by: '',
        order: '',
      },
      skuColumnFilters: createSkuColumnFilterState(),
      skuColumnFilterDraft: createSkuColumnFilterState(),
      skuColumnFilterVisible: createSkuColumnFilterVisibleState(),
      skuTypes: [],
      hasOriginSku: false,
      unfindTip: '',
      hiddenColumns: Array.isArray(stored) ? stored : DEFAULT_HIDDEN_COLUMNS,
      columnSettingVisible: false,
      skuParamsSnapshot: '',
      sortRestoreSeq: 0,
      stableTableColumns: [],
    }
  },
  computed: {
    isSameSku () {
      return this.dataList.length === 1 || this.dataList.map(item => item.instance_type).filter(item => item).length === 1
    },
    customConfig () {
      return {
        checkMethod: ({ row }) => {
          return true
        },
      }
    },
    isPublic () {
      return this.type === 'public'
    },
    isPrivate () {
      return this.type === 'private'
    },
    isIDC () {
      return this.type === 'idc'
    },
    radioConfig () {
      const config = { reserve: true }
      if (this.skuDisabled) {
        config.checkMethod = () => false
        return config
      }
      if (this.disableSkuType && this.supportSkuTypes.length) {
        config.checkMethod = ({ row }) => this.supportSkuTypes.includes(row.name)
      }
      return config
    },
    tableColumnVersionKey () {
      return [
        this.type,
        this.skuDisabled,
        this.hasMeterService,
        this.priceUnit.key,
      ].join('|')
    },
    tableSortConfig () {
      const config = {
        remote: true,
        orders: ['asc', 'desc', null],
      }
      const { order_by, order } = this.skuSort
      if (order_by && order) {
        config.defaultSort = {
          field: this.getSortColumnField(order_by),
          order,
        }
      }
      return config
    },
    tableShowColumns () {
      return this.stableTableColumns.filter(item => !this.hiddenColumns.includes(item.field))
    },
    configurableColumns () {
      return this.stableTableColumns.filter(col => col.field && col.field !== 'radio')
    },
    cpuArchFilterOptions () {
      return Object.values(HOST_CPU_ARCHS)
        .sort((a, b) => a.order - b.order)
        .map(arch => {
          const value = arch.key === HOST_CPU_ARCHS.arm.key ? arch.capabilityKey : arch.key
          const i18nKey = this.$te(`compute.cpu_arch.${value}`) ? `compute.cpu_arch.${value}` : ''
          return {
            value,
            label: i18nKey ? this.$t(i18nKey) : arch.label,
          }
        })
    },
    visibleColumnFields: {
      get () {
        return this.configurableColumns
          .filter(col => !this.hiddenColumns.includes(col.field))
          .map(col => col.field)
      },
      set (val) {
        const allFields = this.configurableColumns.map(col => col.field)
        this.hiddenColumns = allFields.filter(field => !val.includes(field))
        const allHiddenColumns = (storage.get(SKU_HIDDEN_COLUMNS_KEY) || []).filter(field => !allFields.includes(field))

        storage.set(SKU_HIDDEN_COLUMNS_KEY, Array.from(new Set([...this.hiddenColumns, ...allHiddenColumns])))
      },
    },
    skuInfo () {
      let currentCategory = SKU_CATEGORY_MAP[this.hypervisor] || []
      if (this.isPublic) {
        currentCategory = SKU_CATEGORY_MAP.public_cloud
      }
      const categoryOptions = {
        [ALL_SKU_CATEGORY_OPT.key]: {
          ...ALL_SKU_CATEGORY_OPT,
          disabled: false,
        },
      }
      currentCategory.forEach(item => {
        let type = this.hypervisor
        if (this.isPublic) {
          type = 'public_cloud'
        }
        categoryOptions[item] = {
          label: this.getI18NValue(`skuCategoryOptions.${type}.${item}`, item),
          key: item,
          disabled: !this.skuTypes.includes(item) || this.skuDisabled,
        }
      })
      const skuOptions = {
        [ALL_SKU_CATEGORY_OPT.key]: [],
      }
      // 套餐去重
      const skuSet = new Set()
      for (let i = 0, len = this.skuList.length; i < len; i++) {
        const item = this.skuList[i]
        const flag = `${item.name}-${item.provider}-${item.region_ext_id}`
        if (skuSet.has(flag)) {
          continue
        }
        skuSet.add(flag)
        const key = item.local_category
        const category = item.instance_type_category
        if (!skuOptions[key]) {
          skuOptions[key] = []
        }
        let hypervisor = this.hypervisor
        if (this.isPublic) {
          hypervisor = item.provider.toLowerCase()
        }
        // 翻译类型
        item.instance_type_category_i18n = this.getI18NValue(`skuCategoryOptions['${hypervisor}']['${category}']`, category)
        item.memory_size_mb_compute = item.memory_size_mb / 1024
        if (this.isSkuEnabled(item)) {
          skuOptions[key].push(item)
          skuOptions[ALL_SKU_CATEGORY_OPT.key].push(item)
        }
      }
      return {
        categoryOptions,
        skuOptions,
      }
    },
    skuResults () {
      if (!this.canSkuShow) return []
      const ret = this.skuInfo.skuOptions[this.skuType]
      const priceKey = this.priceUnit.key
      if (!this.skuSort.order_by && ret && ret.length > 0 && ret[0][priceKey]) {
        ret.sort((a, b) => (a[priceKey] || 0) - (b[priceKey] || 0))
      }
      return ret
    },
    selectedTip () {
      if (this.selectedSkuData?.id) {
        return this.$t('compute.text_182', [
          this.selectedSkuData.name,
          this.selectedSkuData.instance_type_category_i18n,
          this.selectedSkuData.cpu_core_count,
          sizestr(this.selectedSkuData.memory_size_mb, 'M', 1024),
        ])
      }
      return null
    },
  },
  watch: {
    skuParams: {
      handler (val) {
        if (R.isEmpty(val)) {
          this.skuParamsSnapshot = ''
          this.skuList = []
          this.resetSortState()
          this.setSku({})
          return
        }
        const snapshot = this.getSkuParamsSnapshot(val)
        if (snapshot === this.skuParamsSnapshot) return
        this.skuParamsSnapshot = snapshot
        this.resetPageInfo()
        this.resetColumnFilters()
        this.fetchData()
      },
      deep: true,
    },
    skuResults: {
      handler (val, oldV) {
        if (this.skuLoading) return
        if (!val || !val.length) {
          if (this.selectedSkuData?.id) {
            this.setSku({})
          }
          return
        }
        const prevFirstId = oldV && oldV.length ? oldV[0].id : null
        const nextFirstId = val[0].id
        if (prevFirstId !== nextFirstId || !(oldV && oldV.length)) {
          this.setSku(val[0], false)
        }
      },
      deep: true,
    },
    tableColumnVersionKey: {
      immediate: true,
      handler () {
        this.stableTableColumns = this.buildTableColumns()
      },
    },
    skuSort: {
      deep: true,
      handler () {
        this.$nextTick(() => {
          this.syncSortHeaderUI()
        })
      },
    },
  },
  created () {
    this.skusM = new Manager('serverskus')
    if (this.skuParams && !R.isEmpty(this.skuParams)) {
      this.skuParamsSnapshot = this.getSkuParamsSnapshot(this.skuParams)
      this.fetchData()
    }
  },
  methods: {
    getSortHeaderClass (field = '') {
      const { order_by, order } = this.skuSort
      if (!order_by || !order) return ''
      if (this.getSortColumnField(order_by) !== field) return ''
      return `sku-col-sort--${order}`
    },
    withSortableColumn (column = {}) {
      if (!column.sortable) return column
      return {
        ...column,
        headerClassName: ({ column: col }) => this.getSortHeaderClass(col.property),
      }
    },
    buildTableColumns () {
      const column = [
        { type: 'radio', width: 40 },
        {
          field: 'region',
          title: this.$t('compute.text_177'),
          minWidth: 120,
          showOverflow: 'ellipsis',
          slots: this.isPublic ? {
            default: ({ row }) => {
              return this.renderRegionalAvailability(row, 'region')
            },
          } : undefined,
        },
        { field: 'instance_type_category_i18n', title: this.$t('compute.text_175') },
        this.getFilterableColumn('cpu_arch', this.$t('compute.cpu_arch'), {
          filterType: 'select',
          defaultSlot: ({ row }) => (row.cpu_arch ? this.$t(`compute.cpu_arch.${row.cpu_arch}`) : '-'),
        }),
        this.getFilterableColumn('name', this.$t('compute.text_178')),
        this.withSortableColumn({
          field: 'cpu_core_count',
          title: this.$t('compute.text_179'),
          sortable: true,
        }),
        this.withSortableColumn({
          field: 'memory_size_mb_compute',
          title: this.$t('compute.text_180'),
          sortable: true,
        }),
      ]
      const providerColumn = {
        field: 'provider',
        title: this.$t('compute.text_176'),
        slots: {
          default: ({ row }) => {
            return [
              this.getHypervisor(row),
            ]
          },
        },
      }
      if (this.isPublic) {
        column.splice(1, 0, providerColumn)
        column.splice(3, 0, {
          field: 'zone',
          title: this.$t('compute.text_270'),
          minWidth: 120,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              return this.renderRegionalAvailability(row, 'zone')
            },
          },
        })
        column.push(this.getFilterableColumn('cpu_model', this.$t('compute.cpu_model')))
        column.push(this.getFilterableColumn('nic_bandwidth', this.$t('compute.nic_bandwidth')))
        column.push(this.getFilterableColumn('disk_performance', this.$t('compute.disk_performance')))
        if (this.hasMeterService) {
          column.push(this.withSortableColumn({
            field: this.priceUnit.key,
            title: this.$t('compute.text_181'),
            sortable: true,
            slots: {
              default: ({ row }) => {
                const price = this.getFormatPrice(row[this.priceUnit.key])
                if (price > 0) {
                  return [
                    <span style="color: rgb(230, 139, 80);">{ price }</span>,
                    <span> {this.$t(`currencys.${row.currency}`)} / { this.priceUnit.unit }</span>,
                  ]
                }
                return [<span style="color: rgb(230, 139, 80);">--</span>]
              },
            },
          }))
        }
      }
      return column
    },
    getFirstSupportedSku (list = []) {
      if (!this.disableSkuType || !this.supportSkuTypes.length) return null
      if (!Array.isArray(list) || !list.length) return null
      return list.find(item => item?.name && this.supportSkuTypes.includes(item.name)) || null
    },
    fetchData () {
      this.fetchSkuTypes()
      this.fetchSkuListData()
    },
    fetchSkuListData () {
      return this.fetchSkuList()
    },
    getFormatPrice (price) {
      if (price) {
        return price.toFixed(2)
      }
      return '0'
    },
    renderRegionalAvailability (row, type) {
      const { region, zone, regional_availability: regionalAvailability } = row
      if (!Array.isArray(regionalAvailability) || !regionalAvailability.length) {
        const ret = []
        if (type === 'region' && region) {
          ret.push(<a onClick={e => e.preventDefault()}>{ region }</a>)
        }
        if (type === 'zone' && zone) {
          ret.push(<a class="link-color-light" onClick={e => e.preventDefault()}>{ zone }</a>)
        }
        return ret.length ? ret : '-'
      }
      const chargeTypes = []
      if (this.skuParams.postpaid_status === 'available') {
        chargeTypes.push('postpaid')
      }
      if (this.skuParams.prepaid_status === 'available') {
        chargeTypes.push('prepaid')
      }
      return [
        this.$createElement(RegionalAvailabilityPopover, {
          props: { region, zone, regionalAvailability, chargeTypes, skuData: row, hiddenRegion: type === 'zone', hiddenZone: type === 'region' },
        }),
      ]
    },
    skuChange ({ row } = {}) {
      if (this.skuDisabled) return
      if (!row) return
      const tableRef = this.$refs.tableRef
      const selectedRow = tableRef && typeof tableRef.getRadioRecord === 'function'
        ? tableRef.getRadioRecord()
        : null
      // 与 radioConfig.checkMethod 一致：非当前选中且不在 supportSkuTypes 内时不触发切换
      if (
        this.disableSkuType &&
        this.supportSkuTypes.length &&
        !this.supportSkuTypes.includes(row.name) &&
        row.id !== (selectedRow && selectedRow.id)
      ) {
        return
      }
      this.setSku(row, true)
    },
    skuTypeChange () {
      this.resetSortState()
      this.skuPage.currentPage = 1
      this.fetchData()
      if (this.skuResults && this.skuResults.length) {
        this.setSku(this.skuResults[0], true)
      }
    },
    setSku (skuData, isSkuChange) {
      if (!skuData) return
      let chooseSku = skuData
      if (!isSkuChange && this.instanceType) {
        const extSku = this.skuList.find(item => item.name === this.instanceType)
        if (extSku) {
          chooseSku = extSku
        } else {
          if (this.isAdjustConfig && this.isSameSku && !this.hasOriginSku) {
            chooseSku = this.dataSku
            this.unfindTip = this.dataSku?.name
          }
        }
      }
      if (!isSkuChange && this.initSkuData?.name && this.skuList.some(item => item.name && item.name === this.initSkuData?.name)) {
        const sku = this.skuList.find(item => item.name && item.name === this.initSkuData?.name)
        if (sku) {
          chooseSku = sku
        }
      }
      // 自动选中时：若开启 disableSkuType 且存在 supportSkuTypes，则选中一个“可用”的 sku（name 在支持列表内）
      if (
        !isSkuChange &&
        this.disableSkuType &&
        this.supportSkuTypes.length &&
        chooseSku?.name &&
        !this.supportSkuTypes.includes(chooseSku.name)
      ) {
        const supportedSku = this.getFirstSupportedSku(this.skuResults) || this.getFirstSupportedSku(this.skuList)
        if (supportedSku) {
          chooseSku = supportedSku
        } else {
          // 没有任何受支持的 sku 时，不自动选中不可用项
          chooseSku = {}
        }
      }
      this.$nextTick(() => {
        const hasSelected = !!chooseSku?.id
        this.selectedSkuData = hasSelected ? chooseSku : {}
        if (this.$refs.tableRef) {
          if (hasSelected) {
            this.$refs.tableRef.setRadioRow(chooseSku)
          } else if (typeof this.$refs.tableRef.clearRadioRow === 'function') {
            this.$refs.tableRef.clearRadioRow()
          } else {
            // 兼容旧版本：传 null/undefined 以清空选中
            this.$refs.tableRef.setRadioRow(null)
          }
        }
        this.$emit('change', hasSelected ? chooseSku : {})
        this.restoreTableSort()
      })
    },
    getSortColumnField (orderBy = '') {
      const fieldMap = {
        memory_size_mb: 'memory_size_mb_compute',
      }
      return fieldMap[orderBy] || orderBy
    },
    getSortOrderByField (property = '') {
      const orderByMap = {
        cpu_core_count: 'cpu_core_count',
        memory_size_mb_compute: 'memory_size_mb',
      }
      return orderByMap[property] || property
    },
    getHypervisor (data) {
      return data.provider ? PROVIDER_MAP[data.provider].label : PROVIDER_MAP.OneCloud.label
    },
    getI18NValue (key, originVal) {
      if (this.$te(key)) {
        return this.$t(key)
      }
      return originVal
    },
    getSkuParamsSnapshot (params = this.skuParams) {
      if (!params || R.isEmpty(params)) return ''
      const normalized = sanitizeSkuParams(params)
      if (normalized.filter && Array.isArray(normalized.filter)) {
        normalized.filter = [...normalized.filter].sort()
      }
      return JSON.stringify(normalized)
    },
    buildSkuListParams () {
      const params = {
        ...sanitizeSkuParams(this.skuParams),
        limit: this.skuPage.pageSize,
        offset: (this.skuPage.currentPage - 1) * this.skuPage.pageSize,
        '@local_category': this.skuType,
      }
      if (this.skuSort.order_by && this.skuSort.order) {
        params.order_by = this.skuSort.order_by
        params.order = this.skuSort.order
      }
      this.buildColumnFilters().forEach(filter => this.appendSkuFilter(params, filter))
      if (this.skuType === 'all') {
        delete params['@local_category']
      }
      if (!this.skuParams.zone_id) {
        params.distinct = true
      }
      params.enabled = true
      return params
    },
    async fetchSkuList () {
      try {
        this.skuLoading = true
        this.skuList = []
        const params = this.buildSkuListParams()
        let { data } = await this.skusM.list({ params: params })
        this.skuPage.pageSize = data.limit || 10
        this.skuPage.totalResult = data.total || 0

        if (typeof this.skuFilter === 'function') {
          data = this.skuFilter(data.data)
        }

        if (this.skuParams && !R.isEmpty(this.skuParams)) { // 防止网络延迟导致 skuParams 已经为空了，但却赋值了
          this.skuList = data
          if (this.skuList && this.skuList.length) {
            if (this.isAdjustConfig && this.isSameSku && !this.hasOriginSku) {
              if (this.skuList.some(item => item.name && item.name === this.dataSku?.name)) {
                this.hasOriginSku = true
              }
            }
            const first = this.skuResults[0]
            if (first?.id && this.selectedSkuData?.id === first.id && !this.initSkuData?.name) {
              this.$nextTick(() => {
                const tableRef = this.$refs.tableRef
                if (tableRef) {
                  tableRef.setRadioRow(first)
                }
                this.restoreTableSort()
              })
            } else {
              await this.resolveInitSku(first)
            }
          } else if (this.initSkuData?.name) {
            await this.resolveInitSku({})
          }
        }
        this.skuLoading = false
        if (!this.skuList || !this.skuList.length) {
          this.restoreTableSort()
        }
        return data
      } catch (error) {
        this.skuLoading = false
        throw error
      }
    },
    async resolveInitSku (fallback) {
      const name = this.initSkuData?.name
      if (!name) {
        this.setSku(fallback, false)
        return
      }
      if (this.skuList.some(item => item.name === name)) {
        this.setSku(fallback, false)
        return
      }
      try {
        const base = sanitizeSkuParams(this.skuParams)
        delete base.cpu_core_count
        delete base.memory_size_mb
        const { data } = await this.skusM.list({
          params: {
            ...base,
            name,
            limit: 1,
            enabled: true,
          },
        })
        const list = data?.data || data
        const sku = Array.isArray(list) ? list[0] : null
        if (sku?.id) {
          this.skuList = [sku, ...this.skuList.filter(item => item.id !== sku.id)]
          this.setSku(sku, true)
          return
        }
      } catch (e) { /* ignore */ }
      this.setSku(fallback, false)
    },
    restoreTableSort () {
      const { order_by, order } = this.skuSort
      if (!order_by || !order) return

      const seq = ++this.sortRestoreSeq
      const property = this.getSortColumnField(order_by)

      const applySort = () => {
        if (seq !== this.sortRestoreSeq) return
        const current = this.skuSort
        if (!current.order_by || !current.order) {
          this.clearTableSortUI()
          return
        }
        if (
          this.getSortColumnField(current.order_by) !== property ||
          current.order !== order
        ) {
          return
        }
        const grid = this.$refs.tableRef
        const xTable = grid && grid.$refs ? grid.$refs.xTable : null
        if (!xTable || typeof xTable.getColumnByField !== 'function') return

        const column = xTable.getColumnByField(property)
        if (!column) return

        xTable.tableFullColumn.forEach(col => {
          col.order = null
        })
        column.order = order

        const refresh = () => {
          if (seq !== this.sortRestoreSeq) return
          this.syncSortHeaderUI()
          if (typeof xTable.updateStyle === 'function') {
            xTable.updateStyle()
          }
          if (typeof xTable.recalculate === 'function') {
            xTable.recalculate(true)
          }
        }

        if (typeof xTable.$nextTick === 'function') {
          xTable.$nextTick().then(refresh)
        } else {
          refresh()
        }
      }

      this.$nextTick(() => {
        this.$nextTick(() => {
          if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(applySort)
          } else {
            applySort()
          }
        })
      })
    },
    syncSortHeaderUI () {
      const grid = this.$refs.tableRef
      const xTable = grid && grid.$refs ? grid.$refs.xTable : null
      if (xTable && typeof xTable.$forceUpdate === 'function') {
        xTable.$forceUpdate()
      }
    },
    clearTableSortUI () {
      const grid = this.$refs.tableRef
      const xTable = grid && grid.$refs ? grid.$refs.xTable : null
      if (!xTable) return
      if (typeof xTable.clearSort === 'function') {
        xTable.clearSort()
      } else if (xTable.tableFullColumn) {
        xTable.tableFullColumn.forEach(col => {
          col.order = null
        })
      }
      this.syncSortHeaderUI()
    },
    resetSortState () {
      this.sortRestoreSeq += 1
      this.skuSort = {
        order_by: '',
        order: '',
      }
      this.$nextTick(() => {
        this.clearTableSortUI()
      })
    },
    isSupportDiskTypes (supported, required) {
      for (let i = 0; i < required.length; i++) {
        if (!supported.includes(required[i])) {
          return false
        }
      }
      return true
    },
    isSkuEnabled (item) {
      if (this.requireSysDiskType && item.sys_disk_type && !this.isSupportDiskTypes(item.sys_disk_type.split(','), this.requireSysDiskType)) {
        return false
      }
      if (this.requireDataDiskTypes && item.data_disk_types && !this.isSupportDiskTypes(item.data_disk_types.split(','), this.requireDataDiskTypes)) {
        return false
      }
      return true
    },
    getFilterableColumn (field, title, { defaultSlot, filterType = 'input' } = {}) {
      return {
        field,
        title,
        params: {
          columnFilter: this.skuColumnFilters[field] || '',
          columnFilterType: filterType,
        },
        slots: {
          header: () => [this.renderColumnFilterHeader(field, title, filterType)],
          default: defaultSlot || (({ row }) => row[field] || '-'),
        },
      }
    },
    renderColumnFilterContent (field, filterType = 'input') {
      if (filterType === 'select' && field === 'cpu_arch') {
        return (
          <a-select
            value={this.skuColumnFilterDraft[field] || undefined}
            allowClear
            placeholder={this.$t('common.select')}
            style={{ width: '160px' }}
            dropdownClassName="sku-column-filter-select-dropdown"
            dropdownStyle={{ zIndex: 1070 }}
            getPopupContainer={() => document.body}
            onChange={value => this.handleColumnFilterDraftChange(field, value || '')}>
            {this.cpuArchFilterOptions.map(opt => (
              <a-select-option key={opt.value} value={opt.value}>
                { opt.label }
              </a-select-option>
            ))}
          </a-select>
        )
      }
      return (
        <a-input
          value={this.skuColumnFilterDraft[field]}
          allowClear
          placeholder={this.$t('common.search')}
          onChange={e => this.handleColumnFilterDraftChange(field, e.target.value)}
          onPressEnter={e => {
            e.stopPropagation()
            this.applyColumnFilter(field)
          }}
        />
      )
    },
    renderColumnFilterHeader (field, title, filterType = 'input') {
      const hasFilter = Boolean((this.skuColumnFilters[field] || '').trim())
      return (
        <span class="sku-column-filter-header">
          <span class="sku-column-filter-title">{ title }</span>
          <a-popover
            trigger="click"
            placement="bottomRight"
            overlayClassName="sku-column-filter-popover"
            destroyTooltipOnHide
            visible={this.skuColumnFilterVisible[field]}
            overlayStyle={{ zIndex: 1060 }}
            getPopupContainer={() => document.body}
            onVisibleChange={visible => this.handleColumnFilterVisibleChange(field, visible)}>
            <template slot="content">
              { this.renderColumnFilterContent(field, filterType) }
              <div
                class="sku-column-filter-actions"
                onMousedown={e => e.preventDefault()}>
                <a-button
                  size="small"
                  onClick={e => {
                    e.stopPropagation()
                    this.resetColumnFilter(field)
                  }}>
                  {this.$t('common.reset')}
                </a-button>
                <a-button
                  size="small"
                  type="primary"
                  class="ml-2"
                  onClick={e => {
                    e.stopPropagation()
                    this.applyColumnFilter(field)
                  }}>
                  {this.$t('common.ok')}
                </a-button>
              </div>
            </template>
            <span
              class="sku-column-filter-trigger"
              onClick={e => e.stopPropagation()}>
              <a-icon
                type="filter"
                class={{ 'sku-column-filter-icon': true, 'is-active': hasFilter }}
              />
            </span>
          </a-popover>
        </span>
      )
    },
    closeOtherColumnFilterPopovers (activeField) {
      SKU_FILTERABLE_FIELDS.forEach(field => {
        if (field !== activeField && this.skuColumnFilterVisible[field]) {
          this.$set(this.skuColumnFilterVisible, field, false)
        }
      })
    },
    handleColumnFilterVisibleChange (field, visible) {
      if (visible) {
        this.closeOtherColumnFilterPopovers(field)
        this.$set(this.skuColumnFilterDraft, field, this.skuColumnFilters[field] || '')
      }
      this.$set(this.skuColumnFilterVisible, field, visible)
    },
    handleColumnFilterDraftChange (field, value) {
      this.$set(this.skuColumnFilterDraft, field, value)
    },
    applyColumnFilter (field) {
      this.$set(this.skuColumnFilters, field, (this.skuColumnFilterDraft[field] || '').trim())
      this.$set(this.skuColumnFilterVisible, field, false)
      this.skuPage.currentPage = 1
      this.fetchSkuListData()
    },
    resetColumnFilter (field) {
      this.$set(this.skuColumnFilterDraft, field, '')
      this.$set(this.skuColumnFilters, field, '')
      this.$set(this.skuColumnFilterVisible, field, false)
      this.skuPage.currentPage = 1
      this.fetchSkuListData()
    },
    buildColumnFilters () {
      return SKU_FILTERABLE_FIELDS
        .map(field => buildSkuColumnFilterExpr(field, this.skuColumnFilters[field] || ''))
        .filter(Boolean)
    },
    appendSkuFilter (params, filter) {
      if (!filter) return
      const items = Array.isArray(filter) ? filter : [filter]
      if (!params.filter) {
        params.filter = items
        return
      }
      if (!Array.isArray(params.filter)) {
        params.filter = [params.filter]
      }
      params.filter.push(...items)
    },
    skuSortChangeHandle ({ property, order }) {
      if (!order) {
        this.resetSortState()
      } else {
        this.skuSort = {
          order_by: this.getSortOrderByField(property),
          order,
        }
      }
      this.skuPage.currentPage = 1
      this.fetchSkuListData()
    },
    skuPageChangeHandle ({ currentPage = 1, pageSize = 10 }) {
      this.skuPage = {
        ...this.skuPage,
        currentPage,
        pageSize,
      }
      this.fetchSkuListData()
    },
    async fetchSkuTypes () {
      try {
        const params = {
          ...sanitizeSkuParams(this.skuParams),
          field: 'local_category',
        }
        const { data } = await this.skusM.get({ id: 'distinct-field', params })
        this.skuTypes = data[params.field]
      } catch (error) {
        console.log(error)
      }
    },
    resetPageInfo () {
      this.skuPage = {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      }
      this.resetSortState()
    },
    resetColumnFilters () {
      this.skuColumnFilters = createSkuColumnFilterState()
      this.skuColumnFilterDraft = createSkuColumnFilterState()
      this.skuColumnFilterVisible = createSkuColumnFilterVisibleState()
    },
    handleCustomList () {
      this.columnSettingVisible = true
    },
  },
}
</script>
<style lang="scss" scoped>
.sku-pagebar {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
}
.sku-column-setting {
  max-height: 320px;
  overflow-y: auto;
  &-item {
    margin-bottom: 4px;
    white-space: nowrap;
  }
}
</style>
<style lang="scss">
.sku-column-filter-header {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  .sku-column-filter-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sku-column-filter-trigger {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .sku-column-filter-icon {
    color: #bfbfbf;
    flex-shrink: 0;
    &.is-active {
      color: #1890ff;
    }
  }
}
.ant-popover.sku-column-filter-popover {
  z-index: 1060 !important;
  width: 220px;
  .sku-column-filter-actions {
    margin-top: 8px;
    text-align: right;
  }
}
.sku-column-filter-select-dropdown {
  z-index: 1070 !important;
}
.vxe-header--column.sku-col-sort--asc .vxe-sort--asc-btn {
  color: #409eff !important;
}
.vxe-header--column.sku-col-sort--desc .vxe-sort--desc-btn {
  color: #409eff !important;
}
</style>
