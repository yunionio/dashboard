<template>
  <div>
    <a-row v-for="(item, i) in filters" :key="item.key" class="d-flex align-items-center">
      <a-col :span="9" class="d-flex">
        <a-form-item class="mr-1" v-if="i !== 0" style="width: 70px;">
          <base-select
            minWidth="70px"
            v-decorator="decorators.tagCondition(item.key)"
            :options="conditionOpts"
            :select-props="{ placeholder: $t('common.select') }" />
        </a-form-item>
        <a-form-item class="mr-1" :style="{ width: `calc(100% - ${i === 0 ? 0 : 70}px)` }">
          <base-select
            class="w-100"
            :minWidth="`calc(100% - ${i === 0 ? 0 : 70}px)`"
            v-decorator="decorators.tagKey(item.key)"
            :options="tagKeyOpts"
            @change="val => tagKeyChange(val, i, item)"
            :select-props="{ placeholder: $t('common.select'), allowClear: true }" />
        </a-form-item>
      </a-col>
      <a-col :span="3">
        <a-form-item class="mr-1">
          <base-select
            minWidth="50px"
            v-decorator="decorators.tagOperator(item.key)"
            :options="tagOperatorOpts"
            :select-props="{ placeholder: $t('common.select') }" />
        </a-form-item>
      </a-col>
      <a-col :span="12" class="d-flex">
        <a-form-item :style="{ width: `calc(100% - ${i === 0 ? 0 : 20}px)` }">
          <base-select
            class="w-100 mr-1"
            v-decorator="decorators.tagValue(item.key)"
            :options="item.tagValueOpts"
            :select-props="{ placeholder: $t('common.select'), allowClear: true }" />
        </a-form-item>
        <a-form-item style="width: 20px;" v-if="i !== 0">
          <a-icon
            class="dynamic-delete-button ml-1"
            type="minus-circle-o"
            @click="remove(i)" />
        </a-form-item>
      </a-col>
    </a-row>
    <div class="d-flex align-items-center">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{ $t('monitor.monitor_add_filters') }}</a-button>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'

export default {
  name: 'ExplorerFormFilters',
  props: {
    form: {
      type: Object,
      validator: val => val.fc,
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
        { key: '=', label: '=' },
        { key: '!=', label: '!=' },
      ],
    },
    conditionOpts: {
      type: Array,
      default: () => [
        { key: 'AND', label: 'AND' },
        { key: 'OR', label: 'OR' },
      ],
    },
  },
  data () {
    return {
      filters: [
        { key: uuid(), tagValueOpts: [] },
      ],
    }
  },
  computed: {
    tagKeyOpts () {
      if (R.is(Array, this.metricInfo.tag_key)) {
        return this.metricInfo.tag_key.map(v => {
          return {
            key: v,
            label: v,
          }
        })
      }
      return []
    },
  },
  methods: {
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
    },
    tagValueOpts (tagKey) {
      if (R.is(Object, this.metricInfo.tag_value) && tagKey) {
        return (this.metricInfo.tag_value[tagKey] || []).map(v => {
          return {
            key: v,
            label: v,
          }
        })
      }
      return []
    },
  },
}
</script>

<style>

</style>
