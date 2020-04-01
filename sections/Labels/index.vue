<template>
  <div>
    <div class="d-flex" v-for="item in labelList" :key="item.key">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input-group compact v-if="keyBaseSelectProps">
          <div class="d-flex">
            <a-input class="oc-addonBefore ant-input-group-addon" style="width: 80px;" :defaultValue="keyLabel" readonly />
            <base-select v-decorator="decorators.key(item.key)" v-bind="keyBaseSelectProps"  />
          </div>
        </a-input-group>
        <a-input v-else :addonBefore="keyLabel" v-decorator="decorators.key(item.key)" :placeholder="keyPlaceholder" />
      </a-form-item>
      <div class="mx-3"> = </div>
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input :addonBefore="valueLabel" v-decorator="decorators.value(item.key)" :placeholder="valuePlaceholder" />
      </a-form-item>
      <a-button type="danger" shape="circle" icon="delete" @click="del(item)" class="mt-1 ml-3" />
    </div>
    <a-button type="primary" icon="plus" @click="add">添加{{ title }}</a-button>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'

export default {
  name: 'K8SLables',
  props: {
    title: {
      type: String,
      default: '标签',
    },
    keyLabel: {
      type: String,
      default: '键',
    },
    valueLabel: {
      type: String,
      default: '值',
    },
    decorators: {
      type: Object,
      validator: val => R.is(Function, val.key) && R.is(Function, val.value),
    },
    keyPlaceholder: {
      type: String,
      default: '例如：FOO',
    },
    valuePlaceholder: {
      type: String,
      default: '例如：FOO',
    },
    keyBaseSelectProps: {
      type: Object,
    },
  },
  data () {
    return {
      labelList: [],
    }
  },
  methods: {
    add () {
      this.labelList.push({ key: uuid() })
    },
    del (item) {
      const index = this.labelList.findIndex(val => val.key === item.key)
      this.labelList.splice(index, 1)
    },
  },
}
</script>
