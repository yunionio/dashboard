<template>
  <div>
    <div class="d-flex" v-for="(item, i) in labelList" :key="item.key">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input-group compact>
          <div class="d-flex">
            <a-input class="oc-addonBefore ant-input-group-addon" style="width: 80px;" :defaultValue="keyLabel" readonly />
            <suggest-input :localData="localData" style="width: 300px" :autoCompleteProps="keyAutoCompleteProps" @change="val => keyChange(val, i)" v-decorator="decorators.key(item.key)" />
          </div>
        </a-input-group>
      </a-form-item>
      <div class="mx-3 mt-1"> = </div>
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input-group compact>
          <div class="d-flex">
            <a-input class="oc-addonBefore ant-input-group-addon" style="width: 80px;" :defaultValue="valueLabel" readonly />
            <suggest-input :search="valueSearch" :searchMsg="item.path" style="width: 300px" :autoCompleteProps="valueAutoCompleteProps" v-decorator="decorators.value(item.key)" />
          </div>
        </a-input-group>
      </a-form-item>
      <a-button v-if="firstCanDelete || labelList.length > 1" type="danger" shape="circle" icon="delete" @click="del(item)" class="mt-1 ml-3" />
    </div>
    <a-button type="primary" icon="plus" @click="add">{{$t('k8s.text_81', [ title ])}}</a-button>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import i18n from '@/locales'

export default {
  name: 'K8SLabelsComplete',
  props: {
    title: {
      type: String,
      default: i18n.t('k8s.text_82'),
    },
    keyLabel: {
      type: String,
      default: i18n.t('k8s.text_83'),
    },
    valueLabel: {
      type: String,
      default: i18n.t('k8s.text_84'),
    },
    decorators: {
      type: Object,
      validator: val => R.is(Function, val.key) && R.is(Function, val.value),
    },
    keyAutoCompleteProps: {
      type: Object,
      default: () => ({}),
    },
    valueAutoCompleteProps: {
      type: Object,
      default: () => ({}),
    },
    firstCanDelete: {
      type: Boolean,
      default: true,
    },
    localData: {
      type: Object,
      default: () => ({}),
    },
    valueSearch: {
      type: Function,
    },
  },
  data () {
    return {
      labelList: [],
    }
  },
  methods: {
    add () {
      this.labelList.push({ key: uuid(), path: '' })
    },
    del (item) {
      const index = this.labelList.findIndex(val => val.key === item.key)
      this.labelList.splice(index, 1)
    },
    keyChange (value, i) {
      this.labelList[i].path = value
    },
  },
}
</script>
