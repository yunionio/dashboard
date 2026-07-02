<!--
  GPU 型号 + 数量编辑，用于推理模板创建/编辑（每行可选型号与张数，支持多行）。
-->
<template>
  <div class="llm-gpu-devices-editor">
    <div
      v-for="(row, index) in innerRows"
      :key="rowKeys[index]"
      class="llm-gpu-devices-editor__row">
      <base-select
        :value="row.model"
        :options="specList"
        :select-props="modelSelectProps"
        class="llm-gpu-devices-editor__model"
        @change="val => onModelChange(index, val)" />
      <a-input-number
        :value="row.count"
        :min="1"
        :max="maxCount"
        :precision="0"
        class="llm-gpu-devices-editor__count"
        @change="val => onCountChange(index, val)" />
      <span class="llm-gpu-devices-editor__unit">{{ $t('aice.devices.count_unit') }}</span>
      <a-button
        v-if="innerRows.length > 1"
        shape="circle"
        icon="minus"
        size="small"
        class="llm-gpu-devices-editor__remove"
        @click="removeRow(index)" />
    </div>
    <a-button type="link" icon="plus" class="pl-0" @click="addRow">
      {{ $t('aice.devices.add') }}
    </a-button>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import { createEmptyDeviceRow, normalizeDeviceRows } from '@Ai/utils/deviceFormUtils'

export default {
  name: 'LlmGpuDevicesEditor',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    maxCount: {
      type: Number,
      default: 16,
    },
  },
  data () {
    return {
      rowKeys: [uuid()],
    }
  },
  computed: {
    specList () {
      const list = Object.values(this.$store.getters.capability?.pci_model_types || {})
        .filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ key: item.model, label: item.model }))
    },
    modelSelectProps () {
      return {
        placeholder: this.$t('common.tips.select', [this.$t('aice.devices')]),
        allowClear: true,
      }
    },
    innerRows () {
      return normalizeDeviceRows(this.value)
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (val) {
        const rows = normalizeDeviceRows(val)
        while (this.rowKeys.length < rows.length) {
          this.rowKeys.push(uuid())
        }
        while (this.rowKeys.length > rows.length) {
          this.rowKeys.pop()
        }
      },
    },
  },
  methods: {
    emitRows (rows) {
      const normalized = normalizeDeviceRows(rows)
      this.$emit('input', normalized)
      this.$emit('change', normalized)
    },
    onModelChange (index, model) {
      const rows = this.innerRows.map((row, i) => (
        i === index ? { ...row, model } : { ...row }
      ))
      this.emitRows(rows)
    },
    onCountChange (index, count) {
      const rows = this.innerRows.map((row, i) => (
        i === index ? { ...row, count: count ?? 1 } : { ...row }
      ))
      this.emitRows(rows)
    },
    addRow () {
      this.rowKeys.push(uuid())
      this.emitRows([...this.innerRows, createEmptyDeviceRow()])
    },
    removeRow (index) {
      if (this.innerRows.length <= 1) return
      this.rowKeys.splice(index, 1)
      const rows = this.innerRows.filter((_, i) => i !== index)
      this.emitRows(rows.length ? rows : [createEmptyDeviceRow()])
    },
  },
}
</script>

<style lang="less" scoped>
.llm-gpu-devices-editor__row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.llm-gpu-devices-editor__model {
  flex: 1;
  min-width: 0;
}
.llm-gpu-devices-editor__count {
  width: 88px;
}
.llm-gpu-devices-editor__unit {
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
}
.llm-gpu-devices-editor__remove {
  flex-shrink: 0;
}
</style>
