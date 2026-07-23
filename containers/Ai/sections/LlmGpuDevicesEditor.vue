<!--
  GPU 型号 + 共享模式 + 数量编辑，用于推理模板创建/编辑。
  HAMI 时可选手动显存（memory_mb）；留空则建 Pod 时回退模型估算 claim。
-->
<template>
  <div class="llm-gpu-devices-editor">
    <div
      v-for="(row, index) in innerRows"
      :key="rowKeys[index]"
      class="llm-gpu-devices-editor__row">
      <base-select
        :value="row.sharing_mode"
        :options="sharingModeOptions"
        :select-props="sharingModeSelectProps"
        class="llm-gpu-devices-editor__sharing"
        @change="val => onSharingModeChange(index, val)" />
      <base-select
        :value="row.model"
        :options="modelOptionsForRow(row)"
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
      <template v-if="row.sharing_mode === 'HAMI'">
        <a-input-number
          :value="row.memory_mb"
          :min="1"
          :step="1024"
          :precision="0"
          class="llm-gpu-devices-editor__memory"
          :placeholder="$t('aice.devices.memory_mb.placeholder')"
          @change="val => onMemoryMbChange(index, val)" />
        <span class="llm-gpu-devices-editor__unit">MB</span>
      </template>
      <a-button
        v-if="innerRows.length > 1"
        shape="circle"
        icon="minus"
        size="small"
        class="llm-gpu-devices-editor__remove"
        @click="removeRow(index)" />
    </div>
    <div
      v-if="innerRows.some(r => r.sharing_mode === 'HAMI')"
      class="text-color-help llm-gpu-devices-editor__help">
      {{ $t('aice.devices.memory_mb.help') }}
    </div>
    <a-button type="link" icon="plus" class="pl-0" @click="addRow">
      {{ $t('aice.devices.add') }}
    </a-button>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import {
  createEmptyDeviceRow,
  normalizeDeviceRows,
  LLM_SHARING_MODE_VALUES,
  resolveSharingMode,
} from '@Ai/utils/deviceFormUtils'

const SHARING_MODE_I18N = {
  HAMI: 'compute.sharing_mode.hami',
  UNLIMITED: 'compute.sharing_mode.unlimited',
  MPS: 'compute.sharing_mode.mps',
  EXCLUSIVE: 'compute.sharing_mode.exclusive',
}

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
    podPciModels () {
      return Object.values(this.$store.getters.capability?.pci_model_types || {})
        .filter(item => item.hypervisor === 'pod')
    },
    sharingModeOptions () {
      return LLM_SHARING_MODE_VALUES.map(value => ({
        key: value,
        label: this.$t(SHARING_MODE_I18N[value] || value),
      }))
    },
    sharingModeSelectProps () {
      return {
        placeholder: this.$t('common.tips.select', [this.$t('aice.devices.sharing_mode')]),
        allowClear: false,
      }
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
    modelOptionsForRow (row) {
      const sharingMode = resolveSharingMode(row?.sharing_mode)
      const models = new Set()
      this.podPciModels.forEach((item) => {
        if (!item?.model) return
        if (item.sharing_mode && item.sharing_mode !== sharingMode) return
        models.add(item.model)
      })
      if (row?.model) {
        models.add(row.model)
      }
      return Array.from(models).map(model => ({ key: model, label: model }))
    },
    emitRows (rows) {
      const normalized = normalizeDeviceRows(rows)
      this.$emit('input', normalized)
      this.$emit('change', normalized)
    },
    onSharingModeChange (index, sharingMode) {
      const mode = resolveSharingMode(sharingMode)
      const rows = this.innerRows.map((row, i) => {
        if (i !== index) return { ...row }
        const next = { ...row, sharing_mode: mode }
        delete next.memory_mb
        const options = this.modelOptionsForRow(next)
        if (next.model && !options.some(opt => opt.key === next.model)) {
          next.model = undefined
        }
        return next
      })
      this.emitRows(rows)
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
    onMemoryMbChange (index, memoryMb) {
      const rows = this.innerRows.map((row, i) => {
        if (i !== index) return { ...row }
        const next = { ...row }
        const n = parseInt(memoryMb, 10)
        if (n > 0) {
          next.memory_mb = n
        } else {
          delete next.memory_mb
        }
        return next
      })
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
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.llm-gpu-devices-editor__sharing {
  width: 140px;
  flex-shrink: 0;
}
.llm-gpu-devices-editor__model {
  flex: 1;
  min-width: 160px;
}
.llm-gpu-devices-editor__count {
  width: 88px;
}
.llm-gpu-devices-editor__memory {
  width: 120px;
}
.llm-gpu-devices-editor__unit {
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
}
.llm-gpu-devices-editor__help {
  margin-bottom: 4px;
}
.llm-gpu-devices-editor__remove {
  flex-shrink: 0;
}
</style>
