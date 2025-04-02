<template>
  <div>
    <a-tooltip v-if="isPciEmpty" :title="$t('compute.text_146')">
      <span><a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" :value="pciEnable" :disabled="true" /></span>
    </a-tooltip>
    <a-form-item class="mb-2" v-else>
      <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.pciEnable" @change="change" />
    </a-form-item>
    <template v-if="pciEnable">
      <a-form-item v-for="(k, index) in pciForm.fc.getFieldValue('keys')" :key="k">
        <a-row :gutter="[8,0]">
          <a-col :span="4">
            <a-form-item>
              <base-select v-decorator="decorators.pciDevType(k)" :options="getRealPciDevTypeOptions(realPciDevTypeOptions, index)" @change="(val) => onChangeDevType(val, k)" />
            </a-form-item>
          </a-col>
          <a-col :span="9">
            <a-form-item>
              <base-select v-decorator="decorators.pciModel(k)" :options="getRealPciOptions(realPciOptions, index)" @change="(val) => onChangeModel(val, k)"
                :selectProps="{ placeholder: $t('compute.text_147') }" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[8,0]">
          <a-col :span="11">
            <a-form-item class="mb-0">
              <a-radio-group v-decorator="decorators.pciCount(k)" @change="(e) => onChangeCount(e, k)">
                <a-radio-button
                  v-for="item in pciCountOptions"
                  :value="item.key"
                  :disabled="item.disabled"
                  :key="item.key">{{ item.label }}</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-button v-if="index > 0" shape="circle" icon="minus" size="small" @click="remove(k)" />
          </a-col>
        </a-row>
      </a-form-item>
      <div v-if="!isNvidiaVgpu" class="d-flex align-items-center mb-2">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" @click="add">{{ $t('compute.pci.add_transparent_device') }}</a-button>
      </div>
    </template>
  </div>
</template>

<script>
import { GPU_COUNT_OPTIONS, GPU_DEV_TYPE_OPTION_MAP } from '@Compute/constants'

let id = 0
export default {
  name: 'Pci',
  props: {
    form: {
      type: Object,
      require: true,
    },
    decorators: {
      type: Object,
      validator: val => val.pciEnable && val.pciDevType && val.pciModel && val.pciCount,
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
    }
  },
  computed: {
    isPciEmpty () {
      return this.pciOptions && this.pciOptions.length === 0
    },
    pciCountOptions () {
      const target = this.realPciOptions.filter(item => item.dev_type === this.curPciDevType)
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
      const pciDevTypeOptions = this.pciDevTypeOptions.map(item => {
        const vgpuVal = GPU_DEV_TYPE_OPTION_MAP.VGPU.value
        const dev_type = item.dev_type.endsWith(`-${vgpuVal}`) ? vgpuVal : item.dev_type
        return {
          key: dev_type,
          label: GPU_DEV_TYPE_OPTION_MAP[dev_type]?.label || dev_type,
        }
      })
      return pciDevTypeOptions
    },
    realPciOptions () {
      return this.pciOptions.filter(item => item.dev_type.endsWith(this.curPciDevType))
    },
    isNvidiaVgpu () {
      const curPciModel = this.form.fd['pciModel[0]']
      const curPci = this.pciOptions.find(o => o.key === curPciModel)
      return curPci?.dev_type === 'LEGACY-VGPU'
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
          this.$delete(this.form.fd, `pciModel[${key}]`)
          this.$delete(this.form.fd, `pciCount[${key}]`)
        })
      }
    },
    realPciDevTypeOptions (val, oldVal) {
      this.changeSelectedValue()
    },
  },
  beforeCreate () {
    this.pciForm = {}
    this.pciForm.fc = this.$form.createForm(this, { name: 'gpu_form' })
    this.pciForm.fc.getFieldDecorator('keys', { initialValue: [id], preserve: true })
  },
  methods: {
    init () {
      this.initialValue()
    },
    initialValue (id = 0) {
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          [`pciDevType[${id}]`]: this.curPciDevType || this.getRealPciDevTypeOptions(this.realPciDevTypeOptions)[0].key,
          [`pciModel[${id}]`]: this.form.fd['pciModel[0]'] || this.getRealPciOptions(this.realPciOptions)[0].key,
          [`pciCount[${id}]`]: 1,
        })
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
      this.$delete(this.form.fd, `pciModel[${id}]`)
      this.$delete(this.form.fd, `pciCount[${id}]`)
    },
    change (val) {
      this.pciEnable = val
      this.$emit('change', val)
    },
    onChangeDevType (val, key) {
      this.curPciDevType = val
      this.form.fc.setFieldsValue({
        [`pciDevType[${key}]`]: val,
        [`pciModel[${key}]`]: this.realPciOptions[0].key,
        [`pciCount[${key}]`]: 1,
      })
      this.reset()
    },
    onChangeModel (val, key) {
      this.form.fc.setFieldsValue({
        [`pciModel[${key}]`]: val,
      })
      const curPci = this.pciOptions.find(o => o.key === val)
      if (curPci.dev_type === 'LEGACY-VGPU') {
        this.reset()
      }
    },
    onChangeCount (e, key) {
      this.form.fc.setFieldsValue({
        [`pciCount[${key}]`]: e.target.value,
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
