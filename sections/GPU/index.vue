<template>
  <div>
    <a-tooltip v-if="isGpuEmpty" title="当前可用区未接入GPU云服务器">
      <span><a-switch checkedChildren="开" unCheckedChildren="关" :value="gpuEnable" :disabled="true" /></span>
    </a-tooltip>
    <a-form-item class="mb-0" v-else>
      <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.gpuEnable" @change="change" />
    </a-form-item>
    <template v-if="gpuEnable">
      <a-form-item>
        <base-select
          class="w-50"
          :selectProps="{ placeholder: '请选择GPU型号' }"
          :options="gpuOptions"
          v-decorator="decorators.gpu" />
      </a-form-item>
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
import { GPU_COUNT_OPTIONS } from '@Compute/constants'

export default {
  name: 'GPU',
  props: {
    decorators: {
      type: Object,
      validator: val => val.gpuEnable && val.gpu && val.gpuCount,
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
    }
  },
  computed: {
    isGpuEmpty () {
      return this.gpuOptions && this.gpuOptions.length === 0
    },
  },
  methods: {
    change (val) {
      this.gpuEnable = val
    },
  },
}
</script>
