<template>
  <div class="create-server-result-wrap">
    <page-footer>
      <template class="content" v-slot:left>
        <div
          v-for="(tip, idx) of tips"
          :key="idx"
          class="d-flex flex-column justify-content-center flex-grow-1">
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
      <template v-if="hasMeterService" v-slot:right>
        <div class="d-flex align-items-center">
          <div class="mr-4 d-flex align-items-center">
            <div class="text-truncate">费用估算：</div>
            <div class="ml-2 prices">
              <div class="hour text-truncate">
                <template v-if="price">
                  <m-animated-number :value="price" :formatValue="formatToPrice" />
                </template>
                <template v-else>---</template>
              </div>
              <div class="tips text-truncate" v-if="!isPackage">
                <template v-if="priceTips">(合&yen;{{ priceTips.day }}/天 &yen;{{ priceTips.month }}/月)</template>
                <template v-else>---</template>
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
            :disabled="!!errors.length">{{ confirmText }}</a-button>
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
    dataDiskSizes: { // 数据盘磁盘大小之和
      type: Array,
      default: () => [],
    },
    isOpenWorkflow: {
      type: Boolean,
      default: false,
    },
    isServertemplate: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    this.getPriceList = _.debounce(this.getPriceList, 500)
    return {
      pricesList: [],
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
      let ret = '通用云服务器'
      if (this.fd.gpuEnable) {
        ret = 'GPU云服务器'
      }
      return ret
    },
    disk () {
      const diskValueArr = []
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
      ret.push(`${this.disk}GB磁盘（${_.get(this.fd, 'systemDiskType.label') || '-'}）`)
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
    price () {
      if (this.pricesList && this.pricesList.length > 0) {
        return this.pricesList[0].sum_price
      }
      return null
    },
    priceTips () {
      if (this.price) {
        return {
          day: (this.price * 24).toFixed(2),
          month: (this.price * 24 * 30).toFixed(2),
        }
      }
      return null
    },
    hasMeterService () { // 是否有计费的服务
      const { services } = this.$store.getters.userInfo
      const meterService = services.find(val => val.type === 'meter')
      if (meterService && meterService.status === true) {
        return true
      }
      return false
    },
    confirmText () {
      if (this.isServertemplate) return '保存模板'
      return this.isOpenWorkflow ? '提交工单' : '新 建'
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
  },
  methods: {
    changeErrors (errors) {
      this.$emit('update:errors', [])
    },
    formatToPrice (val) {
      let ret = `¥ ${val.toFixed(2)}`
      if (this.isPackage) {
        return ret
      }
      ret += ' / 时'
      return ret
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    // 获取总价格
    async getPriceList () {
      if (!this.hasMeterService) return // 如果没有 meter 服务则取消调用
      if (R.isEmpty(this.fd.sku) || R.isNil(this.fd.sku)) return
      const skuProvider = this.fd.sku.provider || PROVIDER_MAP.OneCloud.key
      const brand = PROVIDER_MAP[skuProvider].brand
      const params = {
        quantity: this.fd.count,
        brand,
      }
      const { systemDiskSize, systemDiskType } = this.fd
      if (R.isNil(systemDiskSize)) return
      if (this.fi.createType !== SERVER_TYPE.public) {
        let diskSize = Number(systemDiskSize) || 0
        R.forEach((value, key) => {
          diskSize += Number(value) || 0
        }, this.dataDiskSizes)
        // params.provider = 'kvm'
        params.spec = `cpu=${this.fd.vcpu}core;mem=${sizestrWithUnit(this.fd.vmem, 'M', 1024)};disk=${diskSize}GB`
      } else {
        const { sku } = this.fd
        const { region_ext_id: regionExtId, name, zone_ext_id: zoneExtId } = sku
        const image = this.fi.imageMsg
        const osType = image.os_type ? image.os_type.toLowerCase() : ''
        params.region_id = regionExtId
        let provider = skuProvider.toLowerCase()
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
        let dataDiskSpec = []
        const isUcloudAzure = (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key)
        R.forEach((value) => {
          if (isUcloudAzure) {
            dataDiskSpec.push(`${value}:${provider}::${regionExtId}::::disk::${systemDiskType.key}`)
          } else {
            dataDiskSpec.push(`${value}:${systemDiskType.key}`)
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
      color: #999;
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
