<template>
  <div class="disk-wrapper d-flex w-auto">
    <a-form-item :wrapperCol="{ span: 24 }" :validate-status="storageStatusMap.type">
      <a-tag color="blue" v-if="diskTypeLabel && !disabled">{{ diskTypeLabel }}</a-tag>
      <a-select v-else v-decorator="decorator.type" labelInValue :style="{minWidth: '180px'}" @change="typeChange" :disabled="disabled">
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
          :disabled="sizeDisabled" />
      </a-tooltip>
    </a-form-item>
    <!-- 快照和挂载点不能共存 -->
    <template v-if="!showMountpoint && has('snapshot') && !disabled">
      <a-button class="mt-1" v-if="!showSnapshot" type="link" @click="() => showSnapshot = true">{{$t('compute.text_133')}}</a-button>
      <a-form-item v-else class="mx-1" :wrapperCol="{ span: 24 }">
        <base-select
          v-decorator="decorator.snapshot"
          resource="snapshots"
          :params="snapshotsParams"
          :item.sync="snapshotObj"
          :select-props="{ placeholder: $t('compute.text_124') }" />
      </a-form-item>
    </template>
    <template v-if="!showSnapshot && has('mount-point') && !disabled">
      <a-button class="mt-1" v-if="!showMountpoint" type="link" @click="() => showMountpoint = true">{{$t('compute.text_134')}}</a-button>
      <disk-mountpoint
        class="mx-1"
        v-else
        :decorators="{ filetype: decorator.filetype, mountPath: decorator.mountPath }" />
    </template>
    <template v-if="has('schedtag') && !showStorage">
      <schedtag-policy v-if="showSchedtag" :form="form" :decorators="{ schedtag: decorator.schedtag, policy: decorator.policy }" :schedtag-params="schedtagParams" />
      <a-button v-if="!disabled" class="mt-1" type="link" @click="() => showSchedtag = !showSchedtag">{{ showSchedtag ? $t('compute.text_135') : $t('compute.text_1315') }}</a-button>
    </template>
    <template v-if="has('storage') && !showSchedtag">
      <storage :decorators="decorator" :storageParams="storageParams" v-if="showStorage" />
      <a-button class="mt-1" type="link" @click="() => showStorage = !showStorage">{{ showStorage ? $t('compute.text_135') : $t('compute.text_1350') }}</a-button>
    </template>
    <!-- 磁盘容量预警信息提示 -->
    <a-tooltip v-if="storageStatusMap.tooltip">
      <template slot="title">
        <div slot="help">{{ storageStatusMap.tooltip }}</div>
      </template>
      <a-icon type="exclamation-circle" class="storage-icon" :class="storageClass" />
    </a-tooltip>
  </div>
</template>

<script>
import * as R from 'ramda'
import Storage from './components/Storage'
import { HYPERVISORS_MAP } from '@/constants'
import SchedtagPolicy from '@/sections/SchedtagPolicy'
import DiskMountpoint from '@/sections/DiskMountpoint'

export default {
  name: 'Disk',
  components: {
    SchedtagPolicy,
    DiskMountpoint,
    Storage,
  },
  props: {
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
  },
  data () {
    return {
      showSchedtag: false,
      showMountpoint: false,
      showSnapshot: false,
      showStorage: false,
      snapshotObj: {},
    }
  },
  computed: {
    tooltip () {
      return this.$t('compute.text_137', [this.minSize, this.max])
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
    elements () {
      this.init()
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
      this.snapshotObj = {}
    },
    init () {
      this.showSchedtag = false
      this.showMountpoint = false
      this.showSnapshot = false
      this.showStorage = false
      this.snapshotObj = {}
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
