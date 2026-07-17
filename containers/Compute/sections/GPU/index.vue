<template>
  <div>
    <a-tooltip v-if="isGpuEmpty" :title="$t('compute.text_146')">
      <span><a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" :value="gpuEnable" :disabled="true" /></span>
    </a-tooltip>
    <a-form-item class="mb-0" v-else>
      <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.gpuEnable" @change="change" />
    </a-form-item>
    <template v-if="gpuEnable">
      <a-row>
        <a-col :span="3" class="mr-2">
          <a-form-item>
            <base-select v-decorator="decorators.gpuType" :options="gpuTypeOptions" @change="onChangeGpuType" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item>
            <base-select v-decorator="decorators.gpu" :options="realGpuOptions" :item.sync="curGpuItem"
              :selectProps="{ placeholder: $t('compute.text_147') }" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item class="mb-0">
        <a-radio-group v-decorator="decorators.gpuCount">
          <a-radio-button
            v-for="item in gpuCountOptions"
            :value="item.key"
            :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </template>
  </div>
</template>

<script>
import {
  GPU_COUNT_OPTIONS,
  GPU_TYPE_OPTION_MAP,
  matchPciDevice,
  getGpuTypeSelectOptions,
  resolveGpuTypeBySharingMode,
} from '@Compute/constants'

export default {
  name: 'GPU',
  props: {
    decorators: {
      type: Object,
      validator: val => val.gpuEnable && val.gpu && val.gpuCount && val.gpuType,
    },
    gpuOptions: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      gpuEnable: false,
      gpuCountOptions: GPU_COUNT_OPTIONS,
      curGpuItem: {},
      curGpuType: GPU_TYPE_OPTION_MAP.HPC.value,
    }
  },
  computed: {
    isGpuEmpty () {
      return this.gpuOptions && this.gpuOptions.length === 0
    },
    realGpuOptions () {
      return this.gpuOptions.filter(item => matchPciDevice(item, 'GPU'))
    },
    gpuTypeOptions () {
      return getGpuTypeSelectOptions(this.curGpuItem?.sharing_mode)
    },
  },
  watch: {
    curGpuItem (val) {
      const nextGpuType = resolveGpuTypeBySharingMode(this.curGpuType, val?.sharing_mode)
      if (nextGpuType !== this.curGpuType) {
        this.curGpuType = nextGpuType
        this.$emit('change-gpu-type', nextGpuType)
      }
    },
  },
  methods: {
    change (val) {
      this.gpuEnable = val
      this.$emit('change', val)
    },
    onChangeGpuType (val) {
      this.curGpuType = val
    },
  },
}
</script>
