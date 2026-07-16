<template>
  <div>
    <a-tooltip v-if="isPciEmpty" :title="$t('compute.text_146')">
      <span><a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" :value="pciEnable" :disabled="true" /></span>
    </a-tooltip>
    <a-form-item class="mb-2" v-else>
      <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.pciEnable" @change="change" />
    </a-form-item>
    <template v-if="pciEnable">
      <div
        v-for="(k, index) in pciForm.fc.getFieldValue('keys')"
        :key="k"
        class="pci-group-row">
        <a-form-item class="pci-group">
          <div class="pci-select-row">
            <a-form-item class="pci-select-item pci-select-item--fixed mb-0">
              <fixed-label-filter :label="$t('compute.pci.dev_type_sharing_mode')">
                <base-select v-decorator="decorators.pciDevType(k)" :options="getRealPciDevTypeOptions(realPciDevTypeOptions, index)" @change="(val) => onChangeDevType(val, k)" isDefaultSelect />
              </fixed-label-filter>
            </a-form-item>
            <a-form-item v-if="isCurGpuDevType(k)" class="pci-select-item pci-select-item--fixed mb-0">
              <fixed-label-filter :label="$t('compute.pci.gpu_mode')">
                <base-select v-decorator="decorators.pciGpuType(k)" :options="getGpuTypeOptions(k)" @change="(val) => onChangeGpuType(val, k)" />
              </fixed-label-filter>
            </a-form-item>
            <a-form-item class="pci-select-item pci-select-item--model mb-0">
              <fixed-label-filter :label="$t('compute.pci.vendor_model')">
                <base-select v-decorator="decorators.pciModel(k)" :options="getRealPciOptions(realPciOptions, index)" @change="(val) => onChangeModel(val, k)"
                  :selectProps="{ placeholder: $t('compute.text_147') }" />
              </fixed-label-filter>
            </a-form-item>
          </div>
          <a-row :gutter="[8,0]">
            <a-col :span="20">
              <div class="pci-count-memory-row">
                <a-form-item class="mb-0">
                  <fixed-label-filter :label="$t('compute.text_294')">
                    <a-radio-group class="p-0" v-decorator="decorators.pciCount(k)" @change="(e) => onChangeCount(e, k)">
                      <a-radio-button
                        v-for="item in pciCountOptions"
                        :value="item.key"
                        :disabled="item.disabled"
                        :key="item.key">{{ item.label }}</a-radio-button>
                    </a-radio-group>
                  </fixed-label-filter>
                </a-form-item>
                <a-form-item v-if="isHamiSharingMode(k)" class="mb-0 pci-memory-item">
                  <fixed-label-filter :label="$t('compute.pci.memory_request')">
                    <a-tooltip :title="getMemoryRangeTooltip(k)" class="p-0" placement="top">
                      <disk-size-input
                        v-decorator="decorators.memoryRequest(k)"
                        :min="1"
                        :max="getMemorySizeMb(k) || Infinity"
                        :step="1"
                        :units="['MB', 'GB']"
                        value-unit="MB"
                        default-unit="GB"
                        @change="(val) => onChangeMemoryRequest(val, k)"
                        @unitChange="(unit) => onMemoryUnitChange(k, unit)" />
                    </a-tooltip>
                  </fixed-label-filter>
                </a-form-item>
              </div>
            </a-col>
          </a-row>
        </a-form-item>
        <a-button
          v-if="index > 0"
          class="pci-group-row__remove"
          shape="circle"
          icon="minus"
          size="small"
          @click="remove(k)" />
      </div>
      <div class="d-flex align-items-center mb-2">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" @click="add">{{ $t('compute.pci.add_transparent_device') }}</a-button>
      </div>
    </template>
  </div>
</template>

<script>
import {
  GPU_COUNT_OPTIONS,
  GPU_TYPE_OPTION_MAP,
  ISOLATED_DEVICE_DEV_TYPE_OPTION_MAP,
  ISOLATED_DEVICE_SHARING_MODE_OPTION_MAP,
  matchPciDevice,
  getGpuTypeSelectOptions,
  resolveGpuTypeBySharingMode,
} from '@Compute/constants'
import DiskSizeInput from '@/sections/DiskSizeInput'

let id = 0
export default {
  name: 'Pci',
  components: {
    DiskSizeInput,
  },
  props: {
    form: {
      type: Object,
      require: true,
    },
    decorators: {
      type: Object,
      validator: val => val.pciEnable && val.pciDevType && val.pciGpuType && val.pciModel && val.pciCount && val.memoryRequest,
    },
    pciDevTypeOptions: {
      type: Array,
      default: () => [],
    },
    pciOptions: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      pciEnable: false,
      curPciDevType: '',
      curGpuType: GPU_TYPE_OPTION_MAP.HPC.value,
      memoryUnits: {},
    }
  },
  computed: {
    isPciEmpty () {
      return (this.pciOptions && this.pciOptions.length === 0) || !this.realPciDevTypeOptions.length
    },
    pciCountOptions () {
      const target = this.realPciOptions
      if (target.length) {
        return GPU_COUNT_OPTIONS.map(item => {
          return {
            ...item,
            disabled: item.key > target[0].count,
          }
        })
      }
      return GPU_COUNT_OPTIONS
    },
    realPciDevTypeOptions () {
      const seen = new Set()
      return this.pciDevTypeOptions.reduce((acc, item) => {
        const { dev_type } = item
        const key = item.sharing_mode ? `${dev_type}/${item.sharing_mode}` : dev_type
        if (seen.has(key)) return acc
        seen.add(key)
        const typeLabel = ISOLATED_DEVICE_DEV_TYPE_OPTION_MAP[dev_type]?.label || dev_type
        const sharingModeLabel = ISOLATED_DEVICE_SHARING_MODE_OPTION_MAP[item.sharing_mode]?.label || item.sharing_mode
        acc.push({
          key,
          dev_type,
          label: sharingModeLabel ? `${typeLabel}/${sharingModeLabel}` : typeLabel,
          sharing_mode: item.sharing_mode,
        })
        return acc
      }, [])
    },
    realPciOptions () {
      const { dev_type, sharing_mode } = this.parsePciDevTypeKey(this.curPciDevType)
      return this.pciOptions.filter(item => {
        if (!matchPciDevice(item, dev_type)) return false
        if (!sharing_mode) return true
        return item.sharing_mode === sharing_mode
      })
    },
  },
  watch: {
    pciEnable (val) {
      if (val) {
        this.init()
      } else {
        const keys = this.pciForm.fc.getFieldValue('keys')
        keys.forEach(key => {
          this.$delete(this.form.fd, `pciDevType[${key}]`)
          this.$delete(this.form.fd, `pciGpuType[${key}]`)
          this.$delete(this.form.fd, `pciModel[${key}]`)
          this.$delete(this.form.fd, `pciCount[${key}]`)
          this.$delete(this.form.fd, `memory_request[${key}]`)
        })
      }
    },
    realPciDevTypeOptions (val, oldVal) {
      this.changeSelectedValue()
    },
    isPciEmpty (val) {
      if (val) this.pciEnable = false
    },
  },
  beforeCreate () {
    this.pciForm = {}
    this.pciForm.fc = this.$form.createForm(this, { name: 'gpu_form' })
    this.pciForm.fc.getFieldDecorator('keys', { initialValue: [id], preserve: true })
  },
  methods: {
    parsePciDevTypeKey (key) {
      if (!key) return { dev_type: '', sharing_mode: '' }
      const idx = key.indexOf('/')
      if (idx === -1) return { dev_type: key, sharing_mode: '' }
      return {
        dev_type: key.slice(0, idx),
        sharing_mode: key.slice(idx + 1),
      }
    },
    getPciOptionByKey (key) {
      const pciKey = key || this.curPciDevType
      return this.realPciDevTypeOptions.find(item => item.key === pciKey)
    },
    isCurGpuDevType (key) {
      const pciKey = this.form.fd[`pciDevType[${key}]`] || this.curPciDevType
      const { dev_type } = this.parsePciDevTypeKey(pciKey)
      return dev_type === 'GPU'
    },
    isHamiSharingMode (key) {
      const pciKey = this.form.fd[`pciDevType[${key}]`] || this.curPciDevType
      const option = this.getPciOptionByKey(pciKey)
      return option?.sharing_mode === 'HAMI'
    },
    getGpuTypeOptions (key) {
      const pciKey = this.form.fd[`pciDevType[${key}]`] || this.curPciDevType
      const option = this.getPciOptionByKey(pciKey)
      return getGpuTypeSelectOptions(option?.sharing_mode)
    },
    getMemorySizeMb (key) {
      const modelKey = this.form.fd[`pciModel[${key}]`]
      const curPci = this.pciOptions.find(o => o.key === modelKey) || this.getRealPciOptions(this.realPciOptions, key)[0]
      return curPci?.memory_size_mb
    },
    getMemoryRangeTooltip (key) {
      const maxMb = this.getMemorySizeMb(key)
      if (!maxMb) return ''
      const unit = this.memoryUnits[key] || 'GB'
      const factor = unit === 'GB' ? 1024 : 1
      const min = 1 / factor
      const max = maxMb / factor
      const fmt = (n) => (Number.isInteger(n) ? n : Number(n.toFixed(3)))
      return this.$t('compute.pci.memory_request.range', [fmt(min), fmt(max), unit])
    },
    onMemoryUnitChange (key, unit) {
      this.$set(this.memoryUnits, key, unit)
    },
    init () {
      this.initialValue()
    },
    initialValue (id = 0) {
      this.$nextTick(() => {
        const pciDevType = this.curPciDevType || (this.getRealPciDevTypeOptions(this.realPciDevTypeOptions).length ? this.getRealPciDevTypeOptions(this.realPciDevTypeOptions)[0].key : '')
        const { sharing_mode } = this.parsePciDevTypeKey(pciDevType)
        this.curGpuType = resolveGpuTypeBySharingMode(this.curGpuType, sharing_mode)
        const fields = {
          [`pciDevType[${id}]`]: pciDevType,
          [`pciModel[${id}]`]: this.form.fd['pciModel[0]'] || (this.getRealPciOptions(this.realPciOptions).length ? this.getRealPciOptions(this.realPciOptions)[0].key : ''),
          [`pciCount[${id}]`]: 1,
        }
        if (this.parsePciDevTypeKey(pciDevType).dev_type === 'GPU') {
          fields[`pciGpuType[${id}]`] = this.curGpuType
        }
        this.form.fc.setFieldsValue(fields)
      })
    },
    changeSelectedValue () {
      const keys = this.pciForm.fc.getFieldValue('keys')
      keys.forEach(key => {
        if (this.form.fd[`pciDevType[${key}]`] && !this.getRealPciDevTypeOptions(this.realPciDevTypeOptions).some(item => item.key === this.form.fd[`pciDevType[${key}]`])) {
          if (this.getRealPciDevTypeOptions(this.realPciDevTypeOptions).length) {
            this.form.fc.setFieldsValue({
              [`pciDevType[${key}]`]: this.getRealPciDevTypeOptions(this.realPciDevTypeOptions)[0].key,
            })
            this.curPciDevType = this.getRealPciDevTypeOptions(this.realPciDevTypeOptions)[0].key
          } else {
            this.form.fc.setFieldsValue({
              [`pciDevType[${key}]`]: undefined,
            })
            this.curPciDevType = undefined
          }
        }
        this.$nextTick(() => {
          if (this.form.fd[`pciModel[${key}]`] && !this.getRealPciOptions(this.realPciOptions, key).some(item => item.key === this.form.fd[`pciModel[${key}]`])) {
            if (this.getRealPciOptions(this.realPciOptions, key).length && this.form.fd[`pciDevType[${key}]`]) {
              this.form.fc.setFieldsValue({
                [`pciModel[${key}]`]: this.getRealPciOptions(this.realPciOptions, key)[0].key,
              })
              this.form.fd[`pciModel[${key}]`] = this.getRealPciOptions(this.realPciOptions, key)[0].key
            } else {
              this.form.fc.setFieldsValue({
                [`pciModel[${key}]`]: undefined,
              })
              this.form.fd[`pciModel[${key}]`] = undefined
            }
          }
        })
      })
    },
    removeValue (id) {
      this.$delete(this.form.fd, `pciDevType[${id}]`)
      this.$delete(this.form.fd, `pciGpuType[${id}]`)
      this.$delete(this.form.fd, `pciModel[${id}]`)
      this.$delete(this.form.fd, `pciCount[${id}]`)
      this.$delete(this.form.fd, `memory_request[${id}]`)
    },
    change (val) {
      this.pciEnable = val
      this.$emit('change', val)
    },
    onChangeDevType (val, key) {
      this.curPciDevType = val
      const { sharing_mode } = this.parsePciDevTypeKey(val)
      this.curGpuType = resolveGpuTypeBySharingMode(this.curGpuType, sharing_mode)
      const fields = {
        [`pciDevType[${key}]`]: val,
        [`pciModel[${key}]`]: this.realPciOptions[0]?.key,
        [`pciCount[${key}]`]: 1,
      }
      if (this.parsePciDevTypeKey(val).dev_type === 'GPU') {
        fields[`pciGpuType[${key}]`] = this.curGpuType
      }
      this.form.fc.setFieldsValue(fields)
      if (!this.isHamiSharingMode(key)) {
        this.$delete(this.form.fd, `memory_request[${key}]`)
      }
      this.reset()
    },
    onChangeGpuType (val, key) {
      this.curGpuType = val
      this.form.fc.setFieldsValue({
        [`pciGpuType[${key}]`]: val,
      })
    },
    onChangeModel (val, key) {
      this.form.fc.setFieldsValue({
        [`pciModel[${key}]`]: val,
      })
      const curPci = this.pciOptions.find(o => o.key === val)
      const max = curPci?.memory_size_mb
      const current = this.form.fd[`memory_request[${key}]`]
      if (max && current > max) {
        this.form.fc.setFieldsValue({
          [`memory_request[${key}]`]: max,
        })
      }
    },
    onChangeCount (e, key) {
      this.form.fc.setFieldsValue({
        [`pciCount[${key}]`]: e.target.value,
      })
    },
    onChangeMemoryRequest (val, key) {
      this.form.fc.setFieldsValue({
        [`memory_request[${key}]`]: val,
      })
    },
    add () {
      const { pciForm } = this
      const keys = pciForm.fc.getFieldValue('keys')
      const nextKey = ++id
      const nextKeys = keys.concat(nextKey)
      pciForm.fc.setFieldsValue({ keys: nextKeys })
      this.initialValue(nextKey)
    },
    remove (k) {
      const { pciForm } = this
      const keys = pciForm.fc.getFieldValue('keys')

      if (keys.length === 1) {
        return
      }
      pciForm.fc.setFieldsValue({
        keys: keys.filter(key => key !== k),
      })
      this.removeValue(k)
    },
    reset () {
      const { pciForm } = this
      const keys = pciForm.fc.getFieldValue('keys')

      pciForm.fc.setFieldsValue({
        keys: keys.filter(key => key === 0),
      })
      keys.forEach(k => {
        if (k !== 0) {
          this.removeValue(k)
        }
      })
    },
    getRealPciDevTypeOptions (realPciDevTypeOptions, index = 0) {
      let options = realPciDevTypeOptions
      if (index !== 0) {
        options = realPciDevTypeOptions.filter(o => {
          return this.form.fd['pciDevType[0]'] === o.key
        })
      }
      if (!this.curPciDevType) {
        this.curPciDevType = options[0]?.key
      }
      return options
    },
    getRealPciOptions (realPciOptions, index = 0) {
      let options = realPciOptions
      if (index !== 0) {
        options = realPciOptions.filter(o => {
          return this.form.fd['pciModel[0]'] === o.key
        })
      }
      return options
    },
  },
}
</script>

<style lang="less" scoped>
.pci-group-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 8px;
  }
  &__remove {
    flex-shrink: 0;
  }
}
.pci-group {
  padding: 12px;
  margin-bottom: 0;
  flex: 1;
  min-width: 0;
  // border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
}
.pci-select-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.pci-count-memory-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16px;
}
.pci-memory-item {
  margin-bottom: 0 !important;
}
.pci-select-item {
  margin-bottom: 0 !important;
  // 与 BaseSelect 默认 minWidth 一致
  &--fixed {
    flex: 0 0 auto;
    /deep/ .ant-select {
      width: auto;
    }
  }
  &--model {
    flex: 1 1 500px;
    min-width: 200px;
    /deep/ .ant-select {
      width: 100%;
    }
  }
}
</style>
