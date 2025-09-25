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
              <span class="value config text-truncate" :class="obj.valueClass">{{ obj.value }}</span>
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
              <div class="hour d-flex">
                <template v-if="price">
                  <m-animated-number :value="price" :formatValue="priceFormat" />
                  <discount-price class="ml-2 mini-text" :discount="discount" :origin="originPrice" />
                </template>
                <template v-else>---</template>
              </div>
              <div class="tips text-truncate">
                <span v-html="priceTips" />
              </div>
            </div>
          </div>
          <!-- <a-dropdown-button
            v-if="$appConfig.isPrivate && !$store.getters.isSysCE && hasCartPermission"
            :title="confirmText"
            class="text-truncate"
            type="primary"
            native-type="submit"
            html-type="submit"
            :loading="loading"
            placement="topLeft"
            :disabled="disabled || !!errors.length">
            {{ confirmText }}
            <a-menu slot="overlay" @click="handleMenuClick">
              <a-menu-item key="add">
                {{ $t('scope.shopcart.add') }}
              </a-menu-item>
            </a-menu>
            <a-icon slot="icon" type="down" />
          </a-dropdown-button> -->
          <a-button
            :title="confirmText"
            class="text-truncate"
            type="primary"
            native-type="submit"
            html-type="submit"
            :loading="loading"
            :disabled="disabled || !!errors.length">{{ confirmText }}</a-button>
          <a-button class="ml-3" @click="handleCancel">{{$t('common.cancel')}}</a-button>
        </div>
        <side-errors :error-title="$t('compute.text_290')" :errors="errors" @update:errors="changeErrors" />
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { SERVER_TYPE, BILL_TYPES_MAP, EIP_TYPES_MAP } from '@Compute/constants'
import { sizestrWithUnit } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'
import { PriceFetcher } from '@/utils/common/price'
import SideErrors from '@/sections/SideErrors'
import DiscountPrice from '@/sections/DiscountPrice'
import { diskSupportTypeMedium, getOriginDiskKey } from '@/utils/common/hypervisor'

export default {
  name: 'BottomBar',
  components: {
    SideErrors,
    DiscountPrice,
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
    hasMeterService: {
      type: Boolean,
      default: true,
    },
    dataDiskSizes: {
      type: Array,
      default: () => [],
    },
    cloudaccountId: String,
  },
  data () {
    this.getPriceList = _.debounce(this._getPriceList2, 1500)
    return {
      origin_price: null,
      discount: 0,
      price: null,
      priceFormat: null,
      currency: '',
      priceTips: '--',
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
    isIDC () {
      return this.type === SERVER_TYPE.idc
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
    dataDisk () {
      const diskValueArr = []
      R.forEachObjIndexed(value => {
        diskValueArr.push(value)
      }, this.fd.dataDiskSizes)
      return diskValueArr.reduce((prevDisk, diskValue) => prevDisk + diskValue, 0)
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
      const { gpu, gpuCount, vcpu, vmem, sku = {} } = this.fd
      if (this.fd.gpuEnable) {
        ret.push(this.$t('compute.text_1134', [gpuCount, gpu]))
      }
      if (sku.cpu_core_count && sku.memory_size_mb) {
        ret.push(this.$t('compute.text_292', [sku.cpu_core_count]))
        ret.push(this.$t('compute.text_293', [sizestrWithUnit(sku.memory_size_mb, 'M', 1024)]))
      } else if (vcpu && vmem) {
        ret.push(this.$t('compute.text_292', [vcpu]))
        ret.push(this.$t('compute.text_293', [sizestrWithUnit(vmem, 'M', 1024)]))
      }
      let diskStr = ''
      if (this.fd.systemDiskSize) diskStr = `${this.$t('compute.text_49')}:${this.fd.systemDiskSize}GB ${_.get(this.fd, 'systemDiskType.label')}`
      if (this.dataDisk) diskStr += `,${this.$t('compute.text_50')}:${this.dataDisk}GB ${this.dataDiskLabel}`
      ret.push(diskStr)
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
    confirmText () {
      return this.$t('compute.text_289')
    },
    dataDiskObj () {
      if (R.is(Object, this.fd.dataDiskTypes)) {
        const keys = Object.keys(this.fd.dataDiskTypes)
        if (keys && keys.length) {
          return this.fd.dataDiskTypes[keys[0]]
        }
      }
      if (R.is(Object, this.fd.dataDiskSizes)) {
        const keys = Object.keys(this.fd.dataDiskSizes)
        if (keys && keys.length) {
          const disk = this.fd[`dataDiskTypes[${keys[0]}]`]
          return disk
        }
      }
      return null
    },
    dataDiskType () {
      if (this.dataDiskObj && this.dataDiskObj.key) return this.dataDiskObj.key
      return ''
    },
    dataDiskLabel () {
      if (this.dataDiskObj && this.dataDiskObj.label) return this.dataDiskObj.label
      return ''
    },
    originPrice () {
      if (this.origin_price) {
        this.$emit('getOriginPrice', this.origin_price)
      }
      return this.origin_price
    },
    hasCartPermission () {
      return hasPermission({ key: 'resource_order_sets_create' })
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
      if (val !== oldV) {
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
    'fd.eip_bgp_type' (val, oldV) {
      this.getPriceList()
    },
    'fd.gpuEnable' (val, oldV) {
      this.getPriceList()
    },
    'fd.backupEnbale' (val, oldV) {
      this.calcPrice()
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
      'fd.gpu',
      'fd.gpuCount',
    ], (val, oldval) => {
      if (val) {
        this.getPriceList()
      }
    })
    this.$bus.$on('VMCreateDisabled', (val) => {
      this.disabled = val
    })
  },
  methods: {
    handleMenuClick (e) {
      if (e.key === 'add') {
        this.$emit('add-cart')
      }
    },
    changeErrors (errors) {
      this.$emit('update:errors', {})
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    async _getPriceList2 () {
      const f = this.fd
      if (!this.hasMeterService || !this.$appConfig.isPrivate) return // 如果没有 meter 服务则取消调用
      if (R.isEmpty(f.sku) || R.isNil(f.sku)) return
      if (this.fi.createType === SERVER_TYPE.public && (R.isNil(f.sku.region_ext_id) || R.isEmpty(f.sku.region_ext_id))) return
      if (!R.is(Number, f.count)) return
      if (R.isNil(f.systemDiskSize)) return

      const pf = new PriceFetcher()
      pf.initialForm(this.$store.getters.scope, f.sku, f.duration, f.billType, this.isPublic, this.cloudaccountId)
      // add price items
      if (this.fi.createType !== SERVER_TYPE.public) {
        // server instance
        pf.addCpu(f.vcpu)
        pf.addMem(f.vmem / 1024)

        // gpu
        if (f.gpuEnable && f.gpu && f.gpu.indexOf('=') >= 0) {
          const tmps = f.gpu.split('=')[1].split(':')
          if (tmps.length >= 2) {
            pf.addGpu(`${tmps[0]}.${tmps[1]}`, f.gpuCount || 0)
          }
        }
      } else {
        // server instance
        pf.addServer(f.sku.name, 1)
        // others
      }

      // disks
      const { systemDiskSize, systemDiskType, hypervisor } = f
      const { systemDiskMedium, dataDiskMedium } = this.form.fi
      let systemDisk = systemDiskType.key
      // 磁盘区分介质
      if (diskSupportTypeMedium(hypervisor)) {
        systemDisk = getOriginDiskKey(systemDisk)
      }
      if (this.fi.createType !== SERVER_TYPE.public) systemDisk = `${systemDiskMedium}::${systemDisk}`
      pf.addDisk(systemDisk, systemDiskSize)
      if (this.dataDiskType) {
        const datadisks = this.dataDiskSizes || (this.dataDisk ? [this.dataDisk] : [])
        let dataDisk = this.dataDiskType
        // 磁盘区分介质
        if (diskSupportTypeMedium(hypervisor)) {
          dataDisk = getOriginDiskKey(dataDisk)
        }
        if (this.fi.createType !== SERVER_TYPE.public) dataDisk = `${dataDiskMedium}::${dataDisk}`
        pf.addDisks(dataDisk, datadisks)
      }

      // eip
      if (f.eip_bw && f.eip_type === EIP_TYPES_MAP.new.key) {
        pf.addEipBandwidth(f.eip_bgp_type || '', f.eip_bw)
      }

      const price = await pf.getPriceObj()
      this.priceObj = price
      this.calcPrice()
    },
    calcPrice () {
      const price = this.priceObj
      if (!price) return
      price.setOptions({ count: this.fd.count || 0, backupEnbale: this.fd.backupEnable })
      this.currency = price.currency
      this.price = price.price
      this.discount = price.discount
      this.priceFormat = price.priceFormat
      this.origin_price = price.originPrice
      this.priceTips = price.priceTips
    },
    handleCancel () {
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../../../src/styles/less/theme';
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
      &.name-value {
        width: 100px;
      }
      &.placeholder {
        color: #888;
        font-style: italic;
      }
    }
    @media screen and (max-width: 1366px) {
      .value {
        max-width: 154px;
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
