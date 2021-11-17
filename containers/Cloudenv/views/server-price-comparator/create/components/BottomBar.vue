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
                  <m-animated-number :value="originPrice" :formatValue="priceFormat" />
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
import { SERVER_TYPE, BILL_TYPES_MAP, EIP_TYPES_MAP } from '@Compute/constants'
import { sizestr } from '@/utils/utils'
import { PriceFetcher } from '@/utils/common/price'
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
    this.getPriceList = _.debounce(this._getPriceList2, 500)
    return {
      origin_price: null,
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
      if (this.fd?.sku?.id) {
        return this.$t('compute.text_182', [
          this.fd.sku.name,
          this.fd.sku.instance_type_category_i18n,
          this.fd.sku.cpu_core_count,
          sizestr(this.fd.sku.memory_size_mb, 'M', 1024),
        ])
      }
      return null
    },
    image () {
      return _.get(this.fd, 'image.label') || ''
    },
    tips () {
      const ret = [
        [
          { label: this.$t('compute.text_175'), labelClass: 'label-w-120', value: this.vmType },
          { label: this.$t('compute.text_295'), labelClass: 'label-w-120', value: this.config },
        ],
        [
          { label: this.$t('compute.text_498'), labelClass: 'label-w-120', value: this.isPackage ? this.$t('billingType.prepaid') : this.$t('billingType.postpaid') },
          { label: this.$t('cloudenv.buy_num'), labelClass: 'label-w-120', value: `${this.fd?.count}${this.$t('common_62')}` },
        ],
        [
          { label: this.$t('compute.text_177'), labelClass: 'label-w-120', value: this.fd.sku?.region },
          { label: this.$t('compute.text_49'), labelClass: 'label-w-120', value: this.systemDisk },
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
      return this.$t('cloudenv.add_to_list')
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
    systemDisk () {
      if (this.fd?.systemDiskSize) {
        return `${this.fd.systemDiskSize}GB ${_.get(this.fd, 'systemDiskType.label')}`
      }
      return '--'
    },
  },
  watch: {
    priceTips: {
      handler (val) {
        let ret = `${this.currency} ${this.originPrice && this.originPrice.toFixed(2)}`
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
    'fd.eip_bgp_type' (val, oldV) {
      this.getPriceList()
    },
    'fd.gpuEnable' (val, oldV) {
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
      'fd.gpu',
      'fd.gpuCount',
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
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    async _getPriceList2 () {
      const f = this.fd
      if (!this.hasMeterService) return // 如果没有 meter 服务则取消调用
      if (R.isEmpty(f.sku) || R.isNil(f.sku)) return
      if (this.fi.createType === SERVER_TYPE.public && (R.isNil(f.sku.region_ext_id) || R.isEmpty(f.sku.region_ext_id))) return
      if (!R.is(Number, f.count)) return
      if (R.isNil(f.systemDiskSize)) return

      const pf = new PriceFetcher()
      pf.initialForm(this.$store.getters.scope, f.sku, f.duration, f.billType, this.isPublic)
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
      const { systemDiskSize, systemDiskType } = f
      const { systemDiskMedium, dataDiskMedium } = this.form.fi
      let systemDisk = systemDiskType.key
      if (this.fi.createType !== SERVER_TYPE.public) systemDisk = `${systemDiskMedium}::${systemDiskType.key}`
      pf.addDisk(systemDisk, systemDiskSize)
      if (this.dataDiskType) {
        const datadisks = this.dataDiskSizes || (this.dataDisk ? [this.dataDisk] : [])
        let dataDisk = this.dataDiskType
        if (this.fi.createType !== SERVER_TYPE.public) dataDisk = `${dataDiskMedium}::${this.dataDiskType}`
        pf.addDisks(dataDisk, datadisks)
      }

      // eip
      if (f.eip_bw && f.eip_type === EIP_TYPES_MAP.new.key) {
        pf.addEipBandwidth(f.eip_bgp_type || '', f.eip_bw)
      }

      const price = await pf.getPriceObj()
      price.setOptions({ count: this.fd.count || 0, backupEnbale: this.fd.backupEnbale })
      this.currency = price.currency
      this.price = price.price
      this.priceFormat = price.priceFormat
      this.origin_price = price.originPrice
      this.priceTips = price.priceTips
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
      &.label-w-120 {
        width: 120px;
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
