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
      :radio-config="{ reserve: true }"
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
import { PROVIDER_MAP, HYPERVISORS_MAP } from '@/constants'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import storage from '@/utils/storage'

const SKU_HIDDEN_COLUMNS_KEY = '__oc_sku_hidden_columns'
const DEFAULT_HIDDEN_COLUMNS = ['cpu_model', 'nic_bandwidth', 'disk_performance']

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
      ratesList: [], // 套餐价格列表
      rateLoading: false,
      skuLoading: false,
      selectedSkuData: {},
      skuType: ALL_SKU_CATEGORY_OPT.key,
      skuPage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
      skuTypes: [],
      hasOriginSku: false,
      unfindTip: '',
      hiddenColumns: Array.isArray(stored) ? stored : DEFAULT_HIDDEN_COLUMNS,
      columnSettingVisible: false,
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
    tableColumn () {
      const column = [
        { field: 'region', title: this.$t('compute.text_177') },
        { field: 'instance_type_category_i18n', title: this.$t('compute.text_175') },
        { field: 'cpu_arch', title: this.$t('compute.cpu_arch'), slots: { default: ({ row }) => { return row.cpu_arch ? this.$t(`compute.cpu_arch.${row.cpu_arch}`) : '-' } } },
        { field: 'name', title: this.$t('compute.text_178') },
        { field: 'cpu_core_count', title: this.$t('compute.text_179') },
        { field: 'memory_size_mb_compute', title: this.$t('compute.text_180') },
      ]
      if (this.skuDisabled) {
        column.unshift({
          field: 'radio',
          width: 40,
          slots: {
            default: ({ row }) => {
              if (row.id === this.selectedSkuData?.id) {
                return [<vxe-radio disabled></vxe-radio>]
              }
              return [<vxe-radio disabled value={false}></vxe-radio>]
            },
          },
        })
      } else {
        column.unshift({
          field: 'radio',
          width: 40,
          slots: {
            default: ({ row }) => {
              if (row.id === this.selectedSkuData?.id) {
                return [<vxe-radio></vxe-radio>]
              }
              if (this.disableSkuType && this.supportSkuTypes.length && !this.supportSkuTypes.includes(row.name)) {
                return [<vxe-radio disabled value={false}></vxe-radio>]
              }
              return [<vxe-radio value={false}></vxe-radio>]
            },
          },
        })
      }
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
        column.push({
          field: 'cpu_model',
          title: this.$t('compute.cpu_model'),
          slots: {
            default: ({ row }) => {
              return row.cpu_model || '-'
            },
          },
        })
        column.push({
          field: 'nic_bandwidth',
          title: this.$t('compute.nic_bandwidth'),
          slots: {
            default: ({ row }) => {
              return row.nic_bandwidth || '-'
            },
          },
        })
        column.push({
          field: 'disk_performance',
          title: this.$t('compute.disk_performance'),
          slots: {
            default: ({ row }) => {
              return row.disk_performance || '-'
            },
          },
        })
        if (this.hasMeterService) {
          column.push({
            field: 'hour_price',
            title: this.$t('compute.text_181'),
            slots: {
              default: ({ row }) => {
                const price = this.getFormatPrice(row.hour_price)
                if (price > 0) {
                  let ret = [<a-icon type="loading" />]
                  if (!this.rateLoading) {
                    ret = [
                      <span style="color: rgb(230, 139, 80);">{ price }</span>,
                      <span> {this.$t(`currencys.${row.currency}`)} / { this.priceUnit.unit }</span>,
                    ]
                  }
                  return ret
                }
                return [<span style="color: rgb(230, 139, 80);">--</span>]
              },
            },
          })
        }
      }
      return column
    },
    tableShowColumns () {
      return this.tableColumn.filter(item => !this.hiddenColumns.includes(item.field))
    },
    configurableColumns () {
      return this.tableColumn.filter(col => col.field && col.field !== 'radio')
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
        if (this.isPublic) {
          item.rate_key = this.genRateKey(item)
          if (this.ratesMap[item.rate_key]) {
            item.hour_price = this.ratesMap[item.rate_key][this.priceUnit.key]
            item.currency = this.ratesMap[item.rate_key].currency
          }
        }
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
    ratesMap () {
      const ret = {}
      for (let i = 0, len = this.ratesList.length; i < len; i++) {
        const item = this.ratesList[i]
        ret[item.data_key] = item
      }
      return ret
    },
    skuResults () {
      if (!this.canSkuShow) return []
      const ret = this.skuInfo.skuOptions[this.skuType]
      if (ret && ret.length > 0 && ret[0].hour_price) {
        ret.sort((a, b) => a.hour_price - b.hour_price)
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
      handler (val, oldV) {
        if (!R.isEmpty(val)) {
          if (!R.equals(val, oldV)) {
            this.resetPageInfo()
            this.fetchData()
          }
        } else {
          this.skuList = []
          this.setSku({})
        }
      },
    },
    skuResults: {
      handler (val, oldV) {
        if (!R.equals(val, oldV)) {
          if (val.length) {
            this.setSku(val[0], false)
          } else {
            this.setSku({})
          }
        }
      },
      deep: true,
    },
  },
  created () {
    this.skusM = new Manager('serverskus')
    this.ratesM = new Manager('cloud_sku_rates', 'v1')
    if (this.skuParams && !R.isEmpty(this.skuParams)) {
      this.fetchData()
    }
  },
  methods: {
    getFirstSupportedSku (list = []) {
      if (!this.disableSkuType || !this.supportSkuTypes.length) return null
      if (!Array.isArray(list) || !list.length) return null
      return list.find(item => item?.name && this.supportSkuTypes.includes(item.name)) || null
    },
    fetchData () {
      this.fetchSkuTypes()
      this.fetchSkuList().then(this.fetchCloudSkuRatesList)
    },
    getFormatPrice (price) {
      if (price) {
        return price.toFixed(2)
      }
      return '0'
    },
    skuChange ({ row } = {}) {
      if (this.skuDisabled) return
      if (!row) return
      // 与 tableColumn 中单选列一致：非当前选中且不在 supportSkuTypes 内时为 disabled，不触发切换
      if (
        this.disableSkuType &&
        this.supportSkuTypes.length &&
        !this.supportSkuTypes.includes(row.name) &&
        row.id !== this.selectedSkuData?.id
      ) {
        return
      }
      this.setSku(row, true)
    },
    skuTypeChange () {
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
      })
    },
    getHypervisor (data) {
      return data.provider ? PROVIDER_MAP[data.provider].label : PROVIDER_MAP.OneCloud.label
    },
    genRateKey (data) {
      const provider = this.getSkuItemProvider(data)
      let ret = `${provider}::${data.region_ext_id}::${data.name}`
      if (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key) {
        ret = `${provider}::${data.region_ext_id}::::instance::${data.name}`
      }
      return ret
    },
    getI18NValue (key, originVal) {
      if (this.$te(key)) {
        return this.$t(key)
      }
      return originVal
    },
    async fetchSkuList () {
      try {
        this.skuLoading = true
        this.skuList = []
        if (this.skuParams.cpu_core_count === 0) {
          delete this.skuParams.cpu_core_count
        }
        if (this.skuParams.memory_size_mb === 0) {
          delete this.skuParams.memory_size_mb
        }
        const params = {
          ...this.skuParams,
          limit: this.skuPage.pageSize,
          offset: (this.skuPage.currentPage - 1) * this.skuPage.pageSize,
          '@local_category': this.skuType,
          // prepaid_status: 'available',
        }
        if (this.skuType === 'all') {
          delete params['@local_category']
        }
        if (!this.skuParams.zone_id) {
          params.distinct = true
        }
        params.enabled = true
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
            this.setSku(this.skuResults[0], false)
          }
        }
        this.skuLoading = false
        return data
      } catch (error) {
        this.skuLoading = false
        throw error
      }
    },
    fetchCloudSkuRatesList () { // 公有云套餐价格
      if (!this.hasMeterService) return // 没有 meter 服务
      if (!this.isPublic) return
      if (!this.skuList || !this.skuList.length) return
      let paramKeys = this.skuList.map(item => {
        const provider = this.getSkuItemProvider(item)
        let ret = `${provider}::${item.region_ext_id || 'NA'}::${item.name || 'NA'}`
        if (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key) {
          ret = `${provider}::${item.region_ext_id}::::instance::${item.name}`
        }
        return ret
      })
      paramKeys = Array.from(new Set(paramKeys))
      const params = {
        param_keys: paramKeys.join('$'),
      }
      this.rateLoading = true
      this.ratesM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.ratesList = data
          this.rateLoading = false
        })
        .catch(() => {
          this.rateLoading = false
        })
    },
    getSkuItemProvider (item) { // 兼容阿里金融云
      let provider = item.provider.toLowerCase()
      if (this.isPublic && item.cloud_env) {
        provider = item.cloud_env.toLowerCase()
      }
      return provider
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
    skuPageChangeHandle ({ currentPage = 1, pageSize = 10 }) {
      this.skuPage = {
        ...this.skuPage,
        currentPage,
        pageSize,
      }
      this.fetchData()
    },
    async fetchSkuTypes () {
      try {
        const params = {
          ...this.skuParams,
          field: 'local_category',
          // postpaid_status: 'available',
        }
        delete params.limit
        delete params.offset
        delete params['@local_category']
        if (this.skuParams.cpu_core_count === 0) {
          delete params.cpu_core_count
        }
        if (this.skuParams.memory_size_mb === 0) {
          delete params.memory_size_mb
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
