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
      <template v-slot:right>
        <div class="d-flex align-items-center">
          <!-- <div v-if="hasMeterService" class="mr-4 d-flex align-items-center">
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
          </div> -->
          <a-button
            size="large"
            type="primary"
            native-type="submit"
            html-type="submit"
            style="width: 120px;"
            :loading="loading"
            :disabled="!!errors.length">{{ isOpenWorkflow && !isInstallOperationSystem ? '提交工单' : '新 建' }}</a-button>
        </div>
        <side-errors error-title="创建主机失败" :errors="errors" @update:errors="changeErrors" />
      </template>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { RESOURCE_TYPES_MAP, SERVER_TYPE, BILL_TYPES_MAP } from '@Compute/constants'
import { sizestrWithUnit } from '@/utils/utils'
// import { HYPERVISORS_MAP, PROVIDER_MAP } from '@/constants'
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
    selectedSpecItem: {
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
    hasMeterService: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      pricesList: [],
      fd: this.form.fc.getFieldsValue(),
    }
  },
  computed: {
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
      const { cpu = 0, mem = '0M' } = this.selectedSpecItem
      ret.push(`${cpu}核CPU`)
      ret.push(`${sizestrWithUnit(mem.substr(0, mem.length - 1), 'M', 1024)}内存`)
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
    isInstallOperationSystem () { // 是否是安装操作系统
      if (this.$route.query.host_id) {
        return true
      }
      return false
    },
  },
  created () {
    this.$bus.$on('updateForm', (values) => {
      this.fd = {
        ...this.fd,
        ...values,
      }
    }, this)
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
  },
}
</script>

<style lang="scss" scoped>
@import '../../../../../src/styles/_variables.scss';

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
