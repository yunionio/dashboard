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
            <div class="text-truncate">{{$t('compute.text_286')}}</div>
            <div class="ml-2 prices">
              <div class="hour position-relative">
                <template v-if="price">
                  <m-animated-number :value="price" :formatValue="formatToPrice" />
                  <div class="discount-badge" v-if="priceData.discount !== 1">
                    <div class="lh-1" v-discount="priceData.discount" />
                    <div class="lh-1 mt-1 text-color-help"><del>{{ originPrice }}</del></div>
                  </div>
                </template>
                <template v-else>---</template>
              </div>
              <div class="tips text-truncate">
                <span v-html="priceTips" />
              </div>
            </div>
          </div>
          <a-button
            :title="confirmText"
            class="text-truncate"
            size="large"
            type="primary"
            native-type="submit"
            html-type="submit"
            style="width: 120px;"
            :loading="loading"
            :disabled="disabled || !!errors.length">{{ confirmText }}</a-button>
        </div>
        <side-errors :error-title="$t('compute.text_290')" :errors="errors" @update:errors="changeErrors" />
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { SERVER_TYPE, BILL_TYPES_MAP } from '@Compute/constants'
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
      type: Object,
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
    // 是否为包年包月
    isPackage () {
      return this.fd.billType === BILL_TYPES_MAP.package.key
    },
    name () {
      return this.fd.name
    },
    zone () {
      let ret = this.fd.zone ? this.fd.zone.label : ''
      if (this.isPublic) {
        ret = this.fd.sku ? this.fd.sku.zone : ''
      }
      return ret
    },
    vmType () {
      let ret = this.$t('compute.text_291', [this.$t('dictionary.server')])
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
        ret.push(this.$t('compute.text_1134', [gpuCount, gpu]))
      }
      if (this.isPublic) {
        if (!R.isNil(this.fd.spec) && !R.isEmpty(this.fd.spec)) {
          ret.push(this.$t('compute.text_292', [this.fd.spec.vcpu_count]))
          ret.push(this.$t('compute.text_1135', [this.fd.spec.vmem_size]))
        }
      } else {
        ret.push(this.$t('compute.text_292', [vcpu]))
        ret.push(this.$t('compute.text_293', [sizestrWithUnit(vmem, 'M', 1024)]))
      }
      ret.push(this.$t('compute.text_1136', [this.disk || 0, _.get(this.fd, 'systemDiskType.label') || '-']))
      return ret.join('、')
    },
    image () {
      return _.get(this.fd, 'image.label') || ''
    },
    tips () {
      const ret = [
        [
          { label: this.$t('compute.text_228'), labelClass: 'label-w-50', value: this.name, valueClass: 'name-value' },
          { label: this.$t('compute.text_294'), labelClass: 'label-w-50', value: this.fd.count },
        ],
        [
          { label: this.$t('compute.text_177'), labelClass: 'label-w-50', value: this.zone },
          { label: this.$t('compute.text_175'), labelClass: 'label-w-50', value: this.vmType },
        ],
        [
          { label: this.$t('compute.text_295'), labelClass: 'label-w-80', value: this.config },
          { label: this.$t('compute.text_267'), labelClass: 'label-w-80', value: this.image },
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
        return _.get(currencys, `[${this.pricesList[0].currency}]`) || currencys.CNY
      }
      return '¥'
    },
    priceTips () {
      if (this.price) {
        if (this.isPackage && this.durationNum) {
          const _day = (this.price / 30 / this.durationNum).toFixed(2)
          const _hour = (parseFloat(_day) / 24).toFixed(2)
          return this.$t('compute.text_1137', [this.currency, _day, this.currency, _hour])
        } else {
          const _day = (this.price * 24).toFixed(2)
          const _month = (parseFloat(_day) * 30).toFixed(2)
          return this.$t('compute.text_1138', [this.currency, _day, this.currency, _month])
        }
      }
      return '--'
    },
    confirmText () {
      if (this.isServertemplate) return this.$t('compute.text_1139')
      return this.isOpenWorkflow ? this.$t('compute.text_288') : this.$t('compute.text_289')
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
    priceData () {
      const data = _.get(this.pricesList, '[0]', { discount: 1 })
      return data
    },
    originPrice () {
      const { count } = this.fd
      if (count && this.pricesList && this.pricesList.length > 0) {
        const { month_gross_price: month, hour_gross_price: sum } = this.pricesList[0]
        let _price = parseFloat(sum)
        if (this.isPackage && this.durationNum) {
          _price = parseFloat(month) * this.durationNum
        }
        return _price * parseFloat(count)
      }
      return null
    },
  },
  watch: {
    priceTips: {
      handler (val) {
        let ret = `${this.currency} ${this.price && this.price.toFixed(2)}`
        ret += !this.isPackage ? this.$t('compute.text_296') : ''
        this.$bus.$emit('VMGetPrice', `${ret} ${val}`)
      },
      immediate: true,
    },
    dataDiskType (val, oldV) {
      if (val !== oldV && this.isPublic) {
        this.getPriceList()
      }
    },
    'fd.eip_type' (val, oldV) {
      this.getPriceList()
    },
    'fd.eip_bw' (val, oldV) {
      this.getPriceList()
    },
    'fd.backupEnable' (val, oldV) {
      this.getPriceList()
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
      this.$emit('update:errors', {})
    },
    formatToPrice (val) {
      let ret = `${this.currency} ${val.toFixed(2)}`
      ret += !this.isPackage ? this.$t('compute.text_296') : ''
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
      if (this.fd.eip_type === 'new') {
        params.eip = this.fd.eip_bw + 'Mb'
      }
      if (this.fd.backupEnable) {
        params.backup_host = true
      }
      try {
        const { data: { data = [] } } = await new this.$Manager('price_infos', 'v1').get({ id: '', params })
        this.pricesList = data
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import "../../../../../../src/styles/less/theme";
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
      color: @error-color;
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
