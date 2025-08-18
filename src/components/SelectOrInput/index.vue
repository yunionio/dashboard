<template>
  <div class="d-flex">
    <a-select
      class="w-100"
      v-if="type === 'select'"
      :value="valueType === 'Object' ? value.id : valueText"
      :placeholder="getUsePlaceholder('select')"
      :disabled="disabled"
      v-bind="{...filterOptions}"
      @change="selectChange">
      <a-select-option v-for="(item,index) of options" :key="index" :value="item.id">
        {{item.name}}<span v-if="item.dropdownShowText" class="text-color-secondary oc-selected-display-none">{{ item.dropdownShowText }}</span>
      </a-select-option>
    </a-select>
    <a-input-number :disabled="disabled" class="w-100" v-else-if="inputType === 'number'" :value="valueType === 'Object' ? value.name : valueText" :placeholder="getUsePlaceholder('input')" @change="inputNumberChange" />
    <a-input v-else :disabled="disabled" :value="valueType === 'Object' ? value.name : valueText" :placeholder="getUsePlaceholder('input')" @change="inputChange" />
    <a-button type="link" @click="handleSwitch" style="padding-right:0" :disabled="disabled">
      <template v-if="showSwitchText">
        {{type === 'select' ? $t('common.switch_to_input') : $t('common.switch_to_select') }}
      </template>
      <icon v-else type="input-switch" size="24" />
    </a-button>
  </div>
</template>

<script>
import _ from 'lodash'
// import { getPlaceholder } from '../constants'
export default {
  name: 'SelectOrInput',
  props: {
    field: {
      required: true,
    },
    valueType: {
      type: String,
      default: 'Object',
    },
    value: {
      required: true,
      default: () => {
        return { id: '', name: '' }
      },
    },
    inputType: {
      default: () => 'text',
    },
    options: {
      required: true,
      type: Array,
      default: () => ([]),
    },
    forceInitType: String,
    filterable: {
      default: false,
      type: Boolean,
    },
    name: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    showSwitchText: Boolean,
  },
  data () {
    let initType = 'input'
    if (this.valueType === 'Object' && this.value.id && this.options.some(item => item.id === this.value.id)) {
      initType = 'select'
    }
    if (this.valueType === 'String' && this.value && this.options.some(item => item.id === this.value)) {
      initType = 'select'
    }
    if (this.valueType === 'Object' && !this.value.id && this.options.length) {
      initType = 'select'
    }
    if (this.valueType === 'String' && !this.value && this.options.length) {
      initType = 'select'
    }
    if (this.forceInitType) {
      initType = this.forceInitType
    }
    return {
      type: initType,
      valueText: this.valueType === 'String' ? this.value : '',
    }
  },
  computed: {
    filterOptions () {
      const props = {}
      if (this.filterable) {
        props.showSearch = true
        props.filterOption = this.filterOption
        props.optionFilterProp = 'children'
      }
      return props
    },
  },
  watch: {
    value (val) {
      if (this.valueType === 'String') {
        this.valueText = val
      }
    },
  },
  methods: {
    changeType (type) {
      this.type = type
    },
    filterOption (input, option) {
      console.log('option', option)
      let text = _.get(option, 'componentOptions.propsData.value') || _.get(option, 'context.value')
      if (!text) {
        const propsData = _.get(option, 'componentOptions.children[0].componentOptions.propsData')
        const nameKey = propsData.nameKey
        if (nameKey) {
          text = propsData.data[nameKey]
        }
      }
      if (text) {
        return text.toLowerCase().includes(input.toLowerCase())
      }
    },
    getUsePlaceholder (type) {
      return this.$t(`common.tips.${type}`, [this.name])
    },
    selectChange (val) {
      const target = this.options.filter(item => item.id === val)
      if (target[0]) {
        if (this.valueType === 'Object') {
          this.value.id = target[0].id
          this.value.name = target[0].name
        } else {
          this.valueText = target[0].id
        }
        this.emitChange()
      }
    },
    inputChange (e) {
      if (this.valueType === 'Object') {
        this.value.id = ''
        this.value.name = e.target.value
      } else {
        this.valueText = e.target.value
      }
      this.emitChange()
    },
    inputNumberChange (val) {
      if (this.valueType === 'Object') {
        this.value.id = ''
        this.value.name = val
      } else {
        this.valueText = val
      }
      this.emitChange()
    },
    async emitChange () {
      await this.$nextTick()
      this.$emit('change', this.valueType === 'Object' ? this.value : this.valueText)
    },
    handleSwitch () {
      if (this.type === 'select') {
        if (this.valueType === 'Object') {
          this.value.id = ''
        }
        this.type = 'input'
      } else {
        if (this.valueType === 'Object') {
          const target = this.options.filter(item => item.name === this.value.name)
          if (target[0]) {
            this.value.id = target[0].id
            this.value.name = target[0].name
          } else {
            this.value.id = ''
            this.value.name = ''
          }
        } else {
          const target = this.options.filter(item => item.id === this.value)
          if (target[0]) {
            this.valueText = target[0].id
          } else {
            this.valueText = ''
          }
        }
        this.type = 'select'
      }
      this.emitChange()
    },
  },
}
</script>
