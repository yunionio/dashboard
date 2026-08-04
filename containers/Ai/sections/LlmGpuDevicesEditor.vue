<!--
  GPU 型号 + 共享模式 + 数量编辑，用于推理模板创建/编辑。
  HAMI 时可选手动显存（memory_mb）；留空则建 Pod 时回退模型估算 claim。
  local_path 场景下可通过 requireHamiMemoryMb 强制必填。
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
        v-if="showVendorField"
        :value="row.vendor"
        :options="vendorOptionsForRow(row)"
        :select-props="vendorSelectProps"
        class="llm-gpu-devices-editor__vendor"
        @change="val => onVendorChange(index, val)" />
      <base-select
        :value="modelSelectValue(row)"
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
          :placeholder="memoryMbPlaceholder"
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
      {{ memoryMbHelp }}
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
  listVendorsForSharingMode,
  buildModelSelectEntries,
  resolveVendorForModel,
  getPodPciModelTypes,
  shouldShowVendorSelect,
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
    requireHamiMemoryMb: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      rowKeys: [uuid()],
    }
  },
  computed: {
    podPciModels () {
      return getPodPciModelTypes(this.$store.getters.capability)
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
    vendorSelectProps () {
      return {
        placeholder: this.$t('common.tips.select', [this.$t('aice.devices.vendor')]),
        allowClear: true,
      }
    },
    memoryMbPlaceholder () {
      return this.requireHamiMemoryMb
        ? this.$t('aice.devices.memory_mb.placeholder_required')
        : this.$t('aice.devices.memory_mb.placeholder')
    },
    memoryMbHelp () {
      return this.requireHamiMemoryMb
        ? this.$t('aice.devices.memory_mb.help_required')
        : this.$t('aice.devices.memory_mb.help')
    },
    innerRows () {
      return normalizeDeviceRows(this.value)
    },
    showVendorField () {
      return shouldShowVendorSelect(this.podPciModels)
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
        this.maybeAutoFillVendors(rows)
      },
    },
    podPciModels () {
      this.maybeAutoFillVendors(this.innerRows)
    },
  },
  methods: {
    maybeAutoFillVendors (rows) {
      if (!Array.isArray(rows) || rows.length === 0) return
      let changed = false
      const next = rows.map((row) => {
        if (String(row?.vendor || '').trim()) return row
        const sharingMode = resolveSharingMode(row?.sharing_mode)
        const model = String(row?.model || '').trim()
        const vendors = listVendorsForSharingMode(this.podPciModels, sharingMode, {
          model: model || undefined,
        })
        if (vendors.length === 1) {
          changed = true
          return { ...row, vendor: vendors[0] }
        }
        return row
      })
      if (changed) {
        this.emitRows(next)
      }
    },
    vendorOptionsForRow (row) {
      const sharingMode = resolveSharingMode(row?.sharing_mode)
      const model = String(row?.model || '').trim()
      const vendors = listVendorsForSharingMode(this.podPciModels, sharingMode, {
        model: model || undefined,
      })
      if (row?.vendor && !vendors.includes(row.vendor)) {
        vendors.push(String(row.vendor).trim())
        vendors.sort()
      }
      return vendors.map(v => ({ key: v, label: v }))
    },
    modelSelectValue (row) {
      if (!row?.model) return undefined
      const vendor = String(row?.vendor || '').trim()
      return vendor ? `${row.model}\0${vendor}` : row.model
    },
    modelOptionsForRow (row) {
      const sharingMode = resolveSharingMode(row?.sharing_mode)
      const vendor = String(row?.vendor || '').trim()
      const entries = buildModelSelectEntries(this.podPciModels, {
        sharingMode,
        vendor: vendor || undefined,
      })
      if (row?.model) {
        const key = vendor ? `${row.model}\0${vendor}` : row.model
        if (!entries.some(e => e.key === key)) {
          entries.push({
            key,
            label: row.model,
            model: row.model,
            vendor: vendor || undefined,
          })
        }
      }
      return entries
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
        const model = String(next.model || '').trim()
        const scopedVendors = listVendorsForSharingMode(this.podPciModels, mode, {
          model: model || undefined,
        })
        const currentVendor = String(next.vendor || '').trim()
        if (currentVendor && !scopedVendors.includes(currentVendor)) {
          delete next.vendor
        }
        if (!next.vendor && scopedVendors.length === 1) {
          next.vendor = scopedVendors[0]
        }
        const options = this.modelOptionsForRow(next)
        if (next.model && !options.some(opt => opt.key === this.modelSelectValue(next))) {
          next.model = undefined
        }
        return next
      })
      this.emitRows(rows)
    },
    onVendorChange (index, vendor) {
      const rows = this.innerRows.map((row, i) => {
        if (i !== index) return { ...row }
        const next = { ...row }
        const v = String(vendor || '').trim()
        if (v) {
          next.vendor = v
        } else {
          delete next.vendor
        }
        const options = this.modelOptionsForRow(next)
        if (next.model && !options.some(opt => opt.model === next.model)) {
          next.model = undefined
        }
        return next
      })
      this.emitRows(rows)
    },
    onModelChange (index, selectKey) {
      const options = this.modelOptionsForRow(this.innerRows[index])
      const opt = options.find(o => o.key === selectKey)
      const rows = this.innerRows.map((row, i) => {
        if (i !== index) return { ...row }
        const next = { ...row, model: opt?.model || selectKey }
        const sharingMode = resolveSharingMode(next.sharing_mode)
        if (opt?.vendor) {
          next.vendor = opt.vendor
        } else {
          const resolved = resolveVendorForModel(next.model, this.podPciModels, { sharingMode })
          if (resolved) {
            next.vendor = resolved
          } else {
            delete next.vendor
          }
        }
        return next
      })
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
      const newRow = createEmptyDeviceRow()
      const vendors = listVendorsForSharingMode(this.podPciModels, newRow.sharing_mode)
      if (vendors.length === 1) {
        newRow.vendor = vendors[0]
      }
      this.emitRows([...this.innerRows, newRow])
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
.llm-gpu-devices-editor__vendor {
  width: 120px;
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
