<template>
  <div class="disk-wrapper d-flex w-auto">
    <a-form-item>
      <a-tag color="blue" v-if="diskTypeLabel">{{ diskTypeLabel }}</a-tag>
      <a-select v-else v-decorator="decorator.type" labelInValue style="width: 180px;" :disabled="disabled">
        <a-select-option v-for="(item, key) of typesMap" :key="key" :value="key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item class="mx-1">
      <a-tooltip :title="tooltip" placement="top">
        <a-input-number
          v-decorator="decorator.size"
          :step="10"
          :min="min"
          :max="max"
          :formatter="format"
          :parser="format"
          :disabled="disabled" />
      </a-tooltip>
      GB
    </a-form-item>
    <!-- 快照和挂载点不能共存 -->
    <template v-if="!showMountpoint && has('mount-point') && !disabled">
      <a-button class="mt-1" v-if="!showSnapshot" type="link" @click="() => showSnapshot = true">快照建磁盘</a-button>
      <a-form-item v-else class="mx-1">
        <base-select
          v-decorator="decorator.snapshot"
          resource="snapshots"
          :params="snapshotsParams"
          :select-props="{ placeholder: '请选择快照' }" />
      </a-form-item>
    </template>
    <template v-if="!showSnapshot && has('snapshot') && !disabled">
      <a-button class="mt-1" v-if="!showMountpoint" type="link" @click="() => showMountpoint = true">设置挂载点</a-button>
      <disk-mountpoint
        class="mx-1"
        v-else
        :decorators="{ filetype: decorator.filetype, mountPath: decorator.mountPath }" />
    </template>
    <template v-if="has('schedtag')">
      <schedtag-policy v-if="showSchedtag" :decorators="{ schedtag: decorator.schedtag, policy: decorator.policy }" :schedtag-params="schedtagParams" />
      <a-button v-if="!disabled" class="mt-1" type="link" @click="() => showSchedtag = !showSchedtag">{{ showSchedtag ? '取消' : '设置' }}调度标签</a-button>
    </template>
  </div>
</template>

<script>
import { HYPERVISORS_MAP } from '@/constants'
import SchedtagPolicy from '@/sections/SchedtagPolicy'
import DiskMountpoint from '@/sections/DiskMountpoint'

export default {
  name: 'Disk',
  components: {
    SchedtagPolicy,
    DiskMountpoint,
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
  },
  data () {
    return {
      schedtagParams: {
        details: true,
        with_meta: true,
        cloud_env: 'onpremise',
        resource_type: 'storages',
        scope: this.$store.getters.scope,
        limit: 0,
      },
      snapshotsParams: {
        details: true,
        with_meta: true,
        cloud_env: 'onpremise',
        limit: 0,
        project_domain: 'default',
        disk_type: 'data',
      },
      showSchedtag: false,
      showMountpoint: false,
      showSnapshot: false,
    }
  },
  computed: {
    tooltip () {
      return `容量范围 ${this.min} ~ ${this.max}GB`
    },
  },
  methods: {
    has (element) {
      return this.elements.includes(element)
    },
    format (num) {
      let n = num
      if (this.hypervisor === HYPERVISORS_MAP.qcloud.key) {
        num = Math.floor(num / 10) * 10
      }
      return n
    },
  },
}
</script>
