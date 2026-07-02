<!--
  GPU 型号多选（兼容旧用法）；推理模板请使用 LlmGpuDevicesEditor。
-->
<template>
  <llm-gpu-devices-editor
    :value="editorValue"
    v-bind="$attrs"
    @change="onEditorChange" />
</template>

<script>
import LlmGpuDevicesEditor from '@Ai/sections/LlmGpuDevicesEditor.vue'
import { aggregateDevicesToRows, expandRowsToDevices } from '@Ai/utils/deviceFormUtils'

export default {
  name: 'LlmGpuDeviceSelect',
  components: {
    LlmGpuDevicesEditor,
  },
  inheritAttrs: false,
  props: {
    value: {
      type: [Array, String],
      default: () => [],
    },
    selectProps: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    editorValue () {
      if (!Array.isArray(this.value) || this.value.length === 0) return []
      if (typeof this.value[0] === 'object' && this.value[0] != null && 'model' in this.value[0]) {
        return this.value
      }
      return aggregateDevicesToRows(this.value.map(model => ({ model })))
    },
  },
  methods: {
    onEditorChange (rows) {
      this.$emit('input', rows)
      this.$emit('change', rows)
    },
  },
}
