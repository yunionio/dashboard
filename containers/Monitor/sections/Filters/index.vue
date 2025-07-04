<template>
  <div>
    <a-row v-for="(item, i) in filters" :key="item.key" class="d-flex align-items-center">
      <a-col :span="9" class="d-flex">
        <a-form-item class="mr-1" v-if="i !== 0" style="width: 70px;">
          <base-select
            minWidth="70px"
            v-decorator="decorators.tagCondition(item.key)"
            :options="conditionOpts"
            :disabled="disabled"
            :select-props="{ placeholder: $t('common.select') }" />
        </a-form-item>
        <a-form-item class="mr-1" :style="{ width: `calc(100% - ${i === 0 ? 0 : 70}px)` }">
          <base-select
            class="w-100"
            :minWidth="`calc(100% - ${i === 0 ? 0 : 70}px)`"
            v-decorator="decorators.tagKey(item.key)"
            :options="tagKeyOpts"
            filterable
            :disabled="disabled"
            @change="val => tagKeyChange(val, i, item)"
            :select-props="{ placeholder: $t('monitor.text_109'), allowClear: true, loading }" />
        </a-form-item>
      </a-col>
      <a-col :span="3">
        <a-form-item class="mr-1">
          <base-select
            minWidth="80px"
            v-decorator="decorators.tagOperator(item.key)"
            :options="tagOperatorOpts"
            :disabled="disabled"
            :select-props="{ placeholder: $t('common.select') }" />
        </a-form-item>
      </a-col>
      <a-col :span="12" class="d-flex">
        <a-form-item :style="{ width: `calc(100% - ${i === 0 ? 0 : 20}px)` }">
          <base-select
            class="w-100 mr-1"
            v-decorator="decorators.tagValue(item.key)"
            :options="item.tagValueOpts"
            filterable
            needBlur
            :disabled="disabled"
            :select-props="{ mode: 'multiple', placeholder: $t('monitor.text_110'), allowClear: true, loading }"
            @change="val => tagValuesChange(val, i, item)"
            @dropdownChange="val => tagValuesDropdownChange(val, i, item)"
            @blur="val => tagValuesChange(val, i, item)" />
        </a-form-item>
        <a-form-item style="width: 20px;" v-if="!disabled && i !== 0">
          <a-button shape="circle" icon="minus" size="small" @click="remove(i)" class="mt-2 ml-2" />
        </a-form-item>
      </a-col>
    </a-row>
    <div class="d-flex align-items-center" v-if="!disabled">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{ $t('monitor.monitor_add_filters') }}</a-button>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import { filterKeyMap } from '@Monitor/constants'

export default {
  name: 'ExplorerFormFilters',
  props: {
    form: {
      type: Object,
      validator: val => val.fc,
    },
    initFilters: {
      type: [],
      default: () => ([]),
    },
    decorators: {
      type: Object,
      required: true,
      validator: val => R.is(Function, val.tagCondition) && R.is(Function, val.tagKey) && R.is(Function, val.tagValue) && R.is(Function, val.tagOperator),
    },
    metricInfo: {
      type: Object,
      default: () => ({}),
    },
    tagOperatorOpts: {
      type: Array,
      default: () => [
        { key: '=~', label: 'IN' },
        { key: '!~', label: 'NOT IN' },
      ],
    },
    conditionOpts: {
      type: Array,
      default: () => [
        { key: 'AND', label: 'AND' },
        { key: 'OR', label: 'OR' },
      ],
    },
    tags: {
      type: Array,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    let filters = [{ key: uuid(), tagValueOpts: [] }]
    if (this.initFilters) {
      filters = this.initFilters
    }
    return {
      filters: filters,
      dropdownVisible: {},
    }
  },
  computed: {
    tagKeyOpts () {
      if (R.is(Array, this.metricInfo.tag_key)) {
        return this.metricInfo.tag_key.map(v => {
          const zh = filterKeyMap[v]
          const label = zh ? (R.is(Object, zh) ? `${this.$t(zh.t)} (${v})` : `${zh} (${v})`) : (v.startsWith('user:') ? v.replace('user:', this.$t('monitor.tag_key')) : v)
          return {
            key: v,
            label,
          }
        }).filter(item => item.key !== 'paltform')
      }
      return []
    },
  },
  watch: {
    metricInfo: {
      deep: true,
      handler: function (val1, val2) {
        if (!R.equals(val1, val2)) {
          if (this.tags && this.tags.length) {
            this.fillFilters(this.tags)
          }
          this.fillFilterValues()
        }
      },
    },
  },
  mounted () {
    if (this.tags && this.tags.length) {
      this.fillFilters(this.tags)
    }
  },
  methods: {
    fillFilters (tags) {
      const tagFields = {}
      this.filters = tags.map(item => {
        const key = uuid()
        const { tagCondition, tagKey, tagValue, tagOperator } = this.decorators
        tagFields[tagKey(key)[0]] = item.key
        tagFields[tagValue(key)[0]] = item.value
        tagFields[tagOperator(key)[0]] = item.operator
        if (item.condition) tagFields[tagCondition(key)[0]] = item.condition
        return {
          key,
          tagValueOpts: this.tagValueOpts(item.key),
        }
      })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue(tagFields)
        this.$forceUpdate()
      })
    },
    fillFilterValues () {
      const values = this.form.fc.getFieldsValue()
      const filters = R.clone(this.filters)
      this.filters = filters.map(item => {
        const { key = '', tagValueOpts = [] } = item
        if (key && !tagValueOpts.length) {
          const { tagKeys = {} } = values
          if (tagKeys[key]) {
            const tagKey = tagKeys[key]
            const opts = this.tagValueOpts(tagKey)
            item.tagValueOpts = [...opts]
          }
        }
        return item
      })
    },
    tagValuesDropdownChange (val, i, item) {
      this.dropdownVisible[i] = val
      if (!val) {
        this.$emit('tagValuesChange', item)
      }
    },
    tagValuesChange (val, i, item) {
      if (!this.dropdownVisible[i]) {
        this.$emit('tagValuesChange', item)
      }
    },
    reset () {
      this.filters = [{ key: uuid(), tagValueOpts: [] }]
    },
    add () {
      this.filters.push({ key: uuid(), tagValueOpts: [] })
    },
    remove (i) {
      this.filters.splice(i, 1)
      this.$emit('remove', i)
    },
    tagKeyChange (val, i, item) {
      this.form.fc.setFieldsValue({
        [this.decorators.tagValue(item.key)[0]]: undefined,
      })
      if (val) {
        this.filters[i].tagValueOpts = this.tagValueOpts(val)
      }
      this.$emit('tagValuesChange')
    },
    tagValueOpts (tagKey) {
      if (R.is(Object, this.metricInfo.tag_value) && tagKey) {
        const vals = (this.metricInfo.tag_value[tagKey] || [])
        vals.sort()
        return vals.map(v => {
          let label = v
          if (v === 'OneCloud') {
            label = this.$t('brand')
          }
          return {
            key: v,
            label,
          }
        })
      }
      return []
    },
  },
}
</script>
