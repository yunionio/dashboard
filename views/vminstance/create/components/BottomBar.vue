<template>
  <div class="create-server-result-wrap">
    <page-footer>
      <template v-slot:left>
        <div
          v-for="(tip, idx) of tips"
          :key="idx"
          class="d-flex flex-column justify-content-center flex-grow-1 content">
          <div
            v-for="obj of tip"
            :key="obj.label"
            class="d-flex align-items-center">
            <span class="label" :class="obj.labelClass">{{ obj.label }}：</span>
            <template v-if="obj.value">
              <span class="value text-truncate" :class="obj.valueClass">{{ obj.value }}</span>
            </template>
            <template v-else>
              <span class="value placeholder text-truncate" :class="obj.valueClass">------</span>
            </template>
          </div>
        </div>
      </template>
      <template v-slot:right>
        <div class="d-flex align-items-center">
          <div v-if="hasMeterService" class="mr-4 d-flex align-items-center">
            <div class="text-truncate">费用估算：</div>
            <div class="ml-2 prices">
              <div class="hour text-truncate">
                <template v-if="price">
                  <m-animated-number :value="price" :formatValue="formatToPrice" />
                </template>
                <template v-else>---</template>
              </div>
              <div class="tips text-truncate">
                <span v-html="priceTips" />
              </div>
            </div>
          </div>
          <a-button
            size="large"
            type="primary"
            native-type="submit"
            html-type="submit"
            style="width: 120px;"
            :loading="loading"
            :disabled="disabled || !!errors.length">{{ confirmText }}</a-button>
        </div>
        <side-errors error-title="创建主机失败" :errors="errors" @update:errors="changeErrors" />
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { RESOURCE_TYPES_MAP, SERVER_TYPE, BILL_TYPES_MAP } from '@Compute/constants'
import { sizestrWithUnit } from '@/utils/utils'
import { HYPERVISORS_MAP, PROVIDER_MAP } from '@/constants'
import SideErrors from '@/sections/SideErrors'

export default {
  name: 'BottomBar',
  components: {
    SideErrors,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      required: true,
    },
    errors: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    resourceType: { // 资源池类型
      type: String,
    },
    isOpenWorkflow: {
      type: Boolean,
      default: false,
    },
    isServertemplate: {
      type: Boolean,
      default: false,
    },
    hasMeterService: {
      type: Boolean,
      default: true,
    },
    dataDiskSizes: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    this.getPriceList = _.debounce(this._getPriceList, 500)
    return {
      pricesList: [],
      disabled: false,
    }
  },
  computed: {
    fd () {
      return this.form.fd
    },
    fi () {
      return this.form.fi
    },
    isPublic () {
      return this.type === SERVER_TYPE.public
    },
    // 是否为预付费资源池
    isPrepaid () {
      return this.resourceType === RESOURCE_TYPES_MAP.prepaid.key
    },
    // 是否为包年包月
    isPackage () {
      return this.fd.billType === BILL_TYPES_MAP.package.key
    },
    name () {
      return this.fd.name
    },
    zone () {
      let ret = this.fd.zone ? this.fd.zone.label : ''
      if (this.isPublic && !this.isPrepaid) {
        ret = this.fd.sku ? this.fd.sku.zone : ''
      }
      return ret
    },
    vmType () {
      let ret = `通用${this.$t('dictionary.server')}`
      if (this.fd.gpuEnable) {
        ret = `GPU${this.$t('dictionary.server')}`
      }
      return ret
    },
    disk () {
      const diskValueArr = [this.fd.systemDiskSize]
      R.forEachObjIndexed(value => {
        diskValueArr.push(value)
      }, this.fd.dataDiskSizes)
      return diskValueArr.reduce((prevDisk, diskValue) => prevDisk + diskValue, 0)
    },
    config () {
      const ret = []
      const { gpu, gpuCount, vcpu, vmem } = this.fd
      if (this.fd.gpuEnable) {
        ret.push(`${gpuCount}块GPU（${gpu}）`)
      }
      if (this.isPublic && this.isPrepaid) {
        if (!R.isNil(this.fd.spec) && !R.isEmpty(this.fd.spec)) {
          ret.push(`${this.fd.spec.vcpu_count}核CPU`)
          ret.push(`${this.fd.spec.vmem_size}GB内存`)
        }
      } else {
        ret.push(`${vcpu}核CPU`)
        ret.push(`${sizestrWithUnit(vmem, 'M', 1024)}内存`)
      }
      ret.push(`${this.disk || 0}GB磁盘（${_.get(this.fd, 'systemDiskType.label') || '-'}）`)
      return ret.join('、')
    },
    image () {
      return this.fd.image.label
    },
    tips () {
      const ret = [
        [
          { label: '名称', labelClass: 'label-w-50', value: this.name, valueClass: 'name-value' },
          { label: '数量', labelClass: 'label-w-50', value: this.fd.count },
        ],
        [
          { label: '区域', labelClass: 'label-w-50', value: this.zone },
          { label: '类型', labelClass: 'label-w-50', value: this.vmType },
        ],
        [
          { label: '配置', labelClass: 'label-w-80', value: this.config },
          { label: '操作系统', labelClass: 'label-w-80', value: this.image },
        ],
      ]
      return ret
    },
    durationNum () {
      if (this.isPackage) {
        const { duration } = this.fd
        let num = parseInt(duration)
        if (num && duration.endsWith('Y')) {
          num *= 12 // 1年=12月
        } else if (num && duration.endsWith('W')) {
          num *= 0.25 // 1周=0.25月
        }
        return num
      }
      return 0
    },
    price () {
      const { count } = this.fd
      if (count && this.pricesList && this.pricesList.length > 0) {
        const { month_price: month, sum_price: sum } = this.pricesList[0]
        let _price = parseFloat(sum)
        if (this.isPackage && this.durationNum) {
          _price = parseFloat(month) * this.durationNum
        }
        return _price * parseFloat(count)
      }
      return null
    },
    currency () {
      const currencys = {
        USD: '$',
        CNY: '¥',
      }
      if (this.pricesList && this.pricesList.length > 0) {
        return currencys[this.pricesList[0].currency]
      }
      return '¥'
    },
    priceTips () {
      if (this.price) {
        if (this.isPackage && this.durationNum) {
          const _day = (this.price / 30 / this.durationNum).toFixed(2)
          const _hour = (parseFloat(_day) / 24).toFixed(2)
          return `(合${this.currency}${_day}/天  ${this.currency}${_hour}/小时)`
        } else {
          const _day = (this.price * 24).toFixed(2)
          const _month = (parseFloat(_day) * 30).toFixed(2)
          return `(合${this.currency}${_day}/天 ${this.currency}${_month}/月)`
        }
      }
      return '--'
    },
    confirmText () {
      if (this.isServertemplate) return '保存模板'
      return this.isOpenWorkflow ? '提交工单' : '新 建'
    },
    dataDiskType () {
      if (R.is(Object, this.fd.dataDiskTypes)) {
        const keys = Object.keys(this.fd.dataDiskTypes)
        if (keys && keys.length) {
          return this.fd.dataDiskTypes[keys[0]].key
        }
      }
      if (R.is(Object, this.fd.dataDiskSizes)) {
        const keys = Object.keys(this.fd.dataDiskSizes)
        if (keys && keys.length) {
          const disk = this.fd[`dataDiskTypes[${keys[0]}]`]
          return disk ? disk.key : ''
        }
      }
      return ''
    },
  },
  watch: {
    priceTips: {
      handler (val) {
        let ret = `${this.currency} ${this.price && this.price.toFixed(2)}`
        ret += !this.isPackage ? ' / 时' : ''
        this.$bus.$emit('VMGetPrice', `${ret} ${val}`)
      },
      immediate: true,
    },
    dataDiskType (val, oldV) {
      if (val !== oldV && this.isPublic) {
        this.getPriceList()
      }
    },
  },
  created () {
    this.baywatch([
      'fd.sku.id',
      'fd.gcounts',
      'fd.duration',
      'fd.billType',
      'fd.systemDiskSize',
      'fd.systemDiskType.key',
      'fd.count',
      'dataDiskSizes',
    ], (val) => {
      if (val) {
        this.getPriceList()
      }
    })
    this.$bus.$on('VMCreateDisabled', (val) => {
      this.disabled = val
    })
  },
  methods: {
    changeErrors (errors) {
      this.$emit('update:errors', [])
    },
    formatToPrice (val) {
      let ret = `${this.currency} ${val.toFixed(2)}`
      ret += !this.isPackage ? ' / 时' : ''
      return ret
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    // 获取总价格
    async _getPriceList () {
      if (!this.hasMeterService) return // 如果没有 meter 服务则取消调用
      if (R.isEmpty(this.fd.sku) || R.isNil(this.fd.sku)) return
      if (!R.is(Number, this.fd.count)) return
      const skuProvider = this.fd.sku.provider || PROVIDER_MAP.OneCloud.key
      const brand = PROVIDER_MAP[skuProvider].brand
      const params = {
        quantity: this.fd.count,
        brand,
      }
      const { systemDiskSize, systemDiskType } = this.fd
      if (R.isNil(systemDiskSize)) return
      if (this.fi.createType !== SERVER_TYPE.public) {
        const diskSize = this.disk || 0
        // params.provider = 'kvm'
        params.spec = `cpu=${this.fd.vcpu}core;mem=${sizestrWithUnit(this.fd.vmem, 'M', 1024)};disk=${diskSize}GB`
      } else {
        const { sku } = this.fd
        const { region_ext_id: regionExtId, name, zone_ext_id: zoneExtId } = sku
        const image = this.fi.imageMsg
        const osType = image.os_type ? image.os_type.toLowerCase() : ''
        params.region_id = regionExtId
        const provider = skuProvider.toLowerCase()
        // params.provider = provider
        // price_key
        if (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key) {
          params.price_key = `${provider}::${regionExtId}::::instance::`
          if (sku.name) {
            params.price_key += `${sku.name}`
          }
        } else {
          params.price_key = `${regionExtId}::${name}::${osType}::${zoneExtId}`
        }
        // spec
        params.spec = `${systemDiskSize}:${systemDiskType.key}`
        if (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key) {
          params.spec = `${systemDiskSize}:${provider}::${regionExtId}::::disk::${systemDiskType.key}`
        }
        const dataDiskSpec = []
        const isUcloudAzure = (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key)
        // if (this.dataDiskSizes && this.dataDiskSizes.length && !this.dataDiskType) return
        R.forEach((value) => {
          if (isUcloudAzure) {
            dataDiskSpec.push(`${value}:${provider}::${regionExtId}::::disk::${this.dataDiskType}`)
          } else {
            dataDiskSpec.push(`${value}:${this.dataDiskType}`)
          }
        }, this.dataDiskSizes)
        if (dataDiskSpec && dataDiskSpec.length > 0) {
          params.spec += `;${dataDiskSpec.join(';')}`
        }
        if (this.fd.billType === BILL_TYPES_MAP.package.key) {
          params.period = this.fd.duration
        }
        params.version = 'v2'
        if (R.isNil(params.region_id) || R.isEmpty(params.region_id)) return
      }
      if (R.isNil(params.brand) || R.isEmpty(params.brand)) return
      // try {
      const { data: { data = [] } } = await new this.$Manager('price_infos', 'v1').get({ id: '', params })
      this.pricesList = data
      // } catch (error) {
      //   console.log(error)
      // }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../../../../src/styles/_variables.scss';

.create-server-result-wrap {
  position: relative;
  font-size: 12px;
  .content {
    width: 80%;
    .label {
      &.label-w-50 {
        width: 50px;
      }
      &.label-w-80 {
        width: 80px;
      }
    }
    .value {
      max-width: 300px;
      &.name-value {
        width: 100px;
      }
      &.placeholder {
        color: #888;
        font-style: italic;
      }
    }
  }
  .prices {
    .hour {
      color: $error-color;
      font-size: 24px;
    }
    .tips {
      color: #999;
      font-size: 12px;
    }
  }
  .btns-wrapper {
    position: absolute;
    right: 20px;
  }
}
</style>
