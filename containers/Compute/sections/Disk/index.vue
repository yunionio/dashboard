<template>
  <div class="disk-wrapper d-flex w-auto">
    <a-form-item :wrapperCol="{ span: 24 }" :validate-status="storageStatusMap.type">
      <a-tag color="blue" v-if="diskTypeLabel && !disabled">{{ diskTypeLabel }}</a-tag>
      <a-select v-else v-decorator="decorator.type" labelInValue :style="{minWidth: '300px'}" @change="typeChange" :disabled="disabled || imageType === 'snapshot'">
        <a-select-option v-for="(item, key) of typesMap" :key="key" :value="key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item class="mx-1" :wrapperCol="{ span: 24 }">
      <a-tooltip :title="tooltip" placement="top">
        <a-input-number
          v-decorator="decorator.size"
          :step="10"
          :min="minSize"
          :max="max"
          :formatter="formatter"
          :parser="parser"
          :disabled="sizeDisabled || (imageType === 'backup' || imageType === 'snapshot')" />
      </a-tooltip>
    </a-form-item>
    <!-- 高级 -->
    <template v-if="showAdvanced">
      <!-- 快照和挂载点不能共存 -->
      <template v-if="!showMountpoint && has('snapshot') && !disabled && imageType !== 'backup' && imageType !== 'snapshot'">
        <a-form-item v-if="showSnapshot" class="mx-1" :wrapperCol="{ span: 24 }">
          <base-select
            v-decorator="decorator.snapshot"
            resource="snapshots"
            :params="snapshotsParams"
            :item.sync="snapshotObj"
            :select-props="{ placeholder: $t('compute.text_124') }" />
        </a-form-item>
        <a-button class="mt-1" type="link" v-show="!simplify" @click="() => showSnapshot = !showSnapshot">{{ showSnapshot ? $t('compute.text_135') : $t('compute.text_133') }}</a-button>
      </template>
      <template v-if="!showSnapshot && has('mount-point') && !disabled && imageType !== 'backup' && imageType !== 'snapshot'">
        <disk-mountpoint
          class="mx-1"
          v-if="showMountpoint"
          :decorators="{ filetype: decorator.filetype, mountPath: decorator.mountPath }" />
          <a-button class="mt-1" type="link" @click="() => showMountpoint = !showMountpoint">{{ showMountpoint ? $t('compute.text_135') : $t('compute.text_134') }}</a-button>
      </template>
      <template v-if="has('schedtag') && !showStorage && !isStorageShow && imageType !== 'backup' && imageType !== 'snapshot'">
        <schedtag-policy v-if="showSchedtag" :form="form" :decorators="{ schedtag: decorator.schedtag, policy: decorator.policy }" :schedtag-params="schedtagParams" :policyReactInSchedtag="false" />
        <a-button v-if="!disabled" v-show="!simplify" class="mt-1" type="link" @click="() => showSchedtag = !showSchedtag">{{ showSchedtag ? $t('compute.text_135') : $t('compute.text_1315') }}</a-button>
      </template>
      <template v-if="has('storage') && !showSchedtag && imageType !== 'snapshot'">
        <storage style="min-width: 480px; max-width: 500px;" :diskKey="diskKey" :decorators="decorator" :storageParams="storageParams" v-if="showStorage" :form="form" :storageHostParams="storageHostParams" @storageHostChange="(val) => $emit('storageHostChange', val)" />
        <a-button v-if="!disabled" class="mt-1" type="link" @click="storageShowClick">{{ showStorage ? $t('compute.text_135') : $t('compute.text_1350') }}</a-button>
      </template>
      <!-- 关机重置 -->
      <a-form-item v-if="isAutoResetShow">
        <a-checkbox v-decorator="decorator.auto_reset">{{ $t('compute.shutdown_auto_reset') }}</a-checkbox>
      </a-form-item>
      <template v-if="isVMware && imageType !== 'backup' && imageType !== 'snapshot'">
        <a-form-item class="mx-1" :wrapperCol="{ span: 24 }">
          <base-select
            v-if="showPreallocation"
            v-decorator="decorator.preallocation"
            :options="preallocationOptions"
            :select-props="{ allowClear: true, placeholder: $t('common.select') }" />
        </a-form-item>
        <a-button v-if="!disabled" class="mt-1" type="link" @click="preallocationShowClick">{{ showPreallocation ? $t('compute.text_135') : $t('compute.assign_preallocation') }}</a-button>
      </template>
      <!-- iops 创建时可设置，修改时禁用 -->
      <template v-if="has('iops') && !disabled && isIopsShow">
        <a-form-item>
          <a-tooltip :title="iopsTooltip" placement="top">
            <a-input-number
              v-if="showIops"
              v-decorator="decorator.iops"
              placeholder="IOPS"
              :min="iopsLimit.min"
              :max="iopsLimit.max"
              :precision="0" />
          </a-tooltip>
        </a-form-item>
        <a-button class="mt-1" type="link" @click="() => changeIopsShow(!showIops)">{{ showIops ? $t('compute.text_135') : $t('compute.set_iops') }}</a-button>
      </template>
      <!-- throughput 创建时可设置，修改时禁用 -->
      <template v-if="has('throughput') && !disabled && isThroughputShow">
        <a-form-item>
          <a-tooltip title="125 ~ 1000MiB/s" placement="top">
            <a-input-number
              v-if="showThroughput"
              v-decorator="decorator.throughput"
              :placeholder="$t('compute.throughput')"
              :min="125"
              :max="1000"
              :precision="0" />
          </a-tooltip>
        </a-form-item>
        <a-button class="mt-1" type="link" @click="() => changeThroughputShow(!showThroughput)">{{ showThroughput ? $t('compute.text_135') : $t('compute.set_throughput') }}</a-button>
      </template>
    </template>
    <template v-if="has('iops') && disabled && isIopsShow && defaultIops && iamgeType !== 'backup' && imageType !== 'snapshot'">
      <span class="ml-2">{{ $t('compute.iops') }}: {{ defaultIops }}</span>
    </template>
    <template v-if="has('throughput') && disabled && isThroughputShow && defaultThroughput && imageType !== 'backup' && imageType !== 'snapshot'">
      <span class="ml-2">{{ $t('compute.throughput') }}: {{ defaultThroughput }}</span>
    </template>
    <!-- 磁盘容量预警信息提示 -->
    <a-tooltip v-if="storageStatusMap.tooltip">
      <template slot="title">
        <div slot="help">{{ storageStatusMap.tooltip }}</div>
      </template>
      <a-icon type="exclamation-circle" class="storage-icon" :class="storageClass" />
    </a-tooltip>
    <a-button v-if="!disabled && hasAdvanced" class="mt-1" type="link" @click="() => showAdvanced = !showAdvanced">{{ showAdvanced ? $t('compute.hide_advanced') : $t('compute.advanced') }}</a-button>
  </div>
</template>

<script>
import * as R from 'ramda'
import { PREALLOCATION_OPTIONS } from '@Compute/constants'
import { HYPERVISORS_MAP } from '@/constants'
import SchedtagPolicy from '@/sections/SchedtagPolicy'
import DiskMountpoint from '@/sections/DiskMountpoint'
import Storage from './components/Storage'

export default {
  name: 'Disk',
  components: {
    SchedtagPolicy,
    DiskMountpoint,
    Storage,
  },
  props: {
    diskKey: String,
    decorator: {
      type: Object,
      required: true,
      validator: val => val.type && val.size,
    },
    typesMap: {
      type: Object,
      default: () => ({}),
    },
    hypervisor: {
      type: String,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    elements: {
      type: Array,
      required: true,
    },
    diskTypeLabel: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    simplify: {
      type: Boolean,
      default: false,
    },
    sizeDisabled: { // 磁盘大小的限制
      type: Boolean,
      default: false,
    },
    snapshotsParams: {
      type: Object,
      default: () => ({
        with_meta: true,
        cloud_env: 'onpremise',
        limit: 0,
      }),
    },
    schedtagParams: {
      type: Object,
      default: () => ({
        with_meta: true,
        cloud_env: 'onpremise',
        resource_type: 'storages',
        limit: 0,
      }),
    },
    storageStatusMap: {
      type: Object,
      default: () => ({}),
    },
    form: {
      type: Object,
      validator: val => !val || val.fc, // 不传 或者 传就有fc
    },
    storageParams: {
      type: Object,
    },
    storageHostParams: Object,
    isStorageShow: {
      type: Boolean,
      default: false,
    },
    isIopsShow: {
      type: Boolean,
      default: false,
    },
    isThroughputShow: {
      type: Boolean,
      default: false,
    },
    iopsLimit: {
      type: Object,
      default: () => ({ min: 0 }),
    },
    isAutoResetShow: {
      type: Boolean,
      default: false,
    },
    defaultIops: {
      type: Number,
      default: 0,
    },
    defaultThroughput: {
      type: Number,
      default: 0,
    },
    imageType: {
      type: String,
    },
  },
  data () {
    return {
      showSchedtag: false,
      showMountpoint: false,
      showSnapshot: false,
      showStorage: false,
      showIops: false,
      showThroughput: false,
      showPreallocation: false,
      snapshotObj: {},
      preallocationOptions: PREALLOCATION_OPTIONS.filter(item => item.value !== 'off').map(item => {
        return {
          id: item.value,
          name: item.label,
        }
      }),
      showAdvanced: false,
    }
  },
  computed: {
    tooltip () {
      return this.$t('compute.text_137', [this.minSize, this.max])
    },
    iopsTooltip () {
      if (this.iopsLimit.min && this.iopsLimit.max) {
        return `${this.iopsLimit.min} ~ ${this.iopsLimit.max}`
      }
      return ''
    },
    minSize () {
      let snapshotSize = this.snapshotObj.size || 0
      if (R.is(Number, snapshotSize)) {
        snapshotSize = snapshotSize / 1024
      }
      return Math.max(this.min, snapshotSize)
    },
    storageClass () {
      return `${this.storageStatusMap.type}-color`
    },
    isVMware () {
      return this.hypervisor === HYPERVISORS_MAP.esxi.key
    },
    hasAdvanced () {
      return this.has('snapshot') || this.has('mount-point') || this.has('schedtag') || this.has('storage') || this.has('iops') || this.has('throughput') || this.isAutoResetShow || this.isVMware
    },
  },
  watch: {
    'snapshotObj.size' (val) {
      if (val) {
        const size = val / 1024
        this.$emit('snapshotChange', size)
      }
    },
    showStorage (v) {
      this.$emit('showStorageChange', v)
    },
    elements (val, oldV) {
      if (!R.equals(val, oldV)) this.init()
    },
  },
  methods: {
    has (element) {
      return this.elements.includes(element)
    },
    parser (value) {
      value = String(value)
      return value.replace(/[GB]*/g, '')
    },
    formatter (num) {
      const n = this.parser(num)
      if (this.hypervisor === HYPERVISORS_MAP.qcloud.key) {
        num = Math.floor(num / 10) * 10
      }
      return `${n}GB`
    },
    typeChange (val) {
      this.$emit('diskTypeChange', val)
      if (this.showStorage) {
        this.$emit('storageHostChange', { disk: this.diskKey, storageHosts: [] })
      }
      this.snapshotObj = {}
    },
    init () {
      this.showSchedtag = false
      this.showMountpoint = false
      this.showSnapshot = false
      this.showStorage = false
      this.snapshotObj = {}
    },
    formatterLabel (row) {
      return row.description ? `${row.name} / ${row.description}` : row.name
    },
    storageShowClick () {
      if (this.showStorage) {
        this.$emit('storageHostChange', { disk: this.diskKey, storageHosts: [] })
      }
      this.showStorage = !this.showStorage
    },
    preallocationShowClick () {
      this.showPreallocation = !this.showPreallocation
      if (this.isVMware) {
        const systemDiskPreallocation = this.form.fd.systemDiskPreallocation
        this.$nextTick(() => {
          if (this.diskKey !== 'system') {
            this.form.fc.setFieldsValue({
              [`dataDiskPreallocation[${this.diskKey}]`]: systemDiskPreallocation,
            })
          }
        })
      }
    },
    changeIopsShow (show) {
      this.showIops = show
    },
    changeThroughputShow (show) {
      this.showThroughput = show
    },
  },
}
</script>

<style lang="less" scoped>
.disk-wrapper{
  .storage-icon{
    position: relative;
    top: 12px;
    margin-left: 10px;
  }
}
</style>
