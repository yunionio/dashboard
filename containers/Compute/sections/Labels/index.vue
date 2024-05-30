<template>
  <div>
    <div class="d-flex" v-for="(item) in labelList" :key="item.key">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input-group compact v-if="keyBaseSelectProps">
          <div class="d-flex">
            <a-input class="oc-addonBefore ant-input-group-addon" style="width: 80px;" :defaultValue="keyLabel" readonly />
            <base-select v-decorator="decorators.key(item.key)" v-bind="getBindProps(item.key)" />
          </div>
        </a-input-group>
        <a-input v-else :addonBefore="keyLabel" v-decorator="decorators.key(item.key)" :placeholder="keyPlaceholder" />
      </a-form-item>
      <div class="mx-3"> = </div>
      <a-form-item :wrapperCol="{ span: 24 }" :extra="valueExtra">
        <a-input :addonBefore="valueLabel" v-decorator="decorators.value(item.key)" :placeholder="valuePlaceholder" />
      </a-form-item>
      <a-button v-if="firstCanDelete || labelList.length > 1" shape="circle" icon="minus" size="small" @click="del(item)" class="mt-2 ml-2" />
    </div>
    <div class="d-flex align-items-center">
      <a-tooltip :title="disableConf?.tooltip">
        <a-button type="primary" :disabled="disableConf?.disabled" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" :disabled="disableConf?.disabled" @click="add">{{$t('compute.repo.add', [ title ])}}</a-button>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import i18n from '@/locales'

export default {
  name: 'ContainerLables',
  props: {
    title: {
      type: String,
      default: i18n.t('compute.repo.label'),
    },
    keyLabel: {
      type: String,
      default: i18n.t('compute.repo.key'),
    },
    valueLabel: {
      type: String,
      default: i18n.t('compute.repo.value'),
    },
    decorators: {
      type: Object,
      validator: val => R.is(Function, val.key) && R.is(Function, val.value),
    },
    keyPlaceholder: {
      type: String,
      default: '',
    },
    valuePlaceholder: {
      type: String,
      default: '',
    },
    keyBaseSelectProps: {
      type: Object,
    },
    firstCanDelete: {
      type: Boolean,
      default: true,
    },
    checkedValues: {
      type: Array,
      default: () => [],
    },
    disableConf: {
      type: Object,
      default: () => { },
    },
  },
  data () {
    return {
      labelList: [],
    }
  },
  watch: {
    labelList: {
      handler (val) {
        this.$emit('label-change', val)
      },
      deep: true,
    },
  },
  methods: {
    add () {
      this.labelList.push({ key: uuid() })
    },
    del (item) {
      const index = this.labelList.findIndex(val => val.key === item.key)
      this.labelList.splice(index, 1)
    },
    reset () {
      this.labelList = []
    },
    getBindProps (key) {
      const { options } = this.keyBaseSelectProps
      const bindProps = {
        ...this.keyBaseSelectProps,
        options: options.filter(v => {
          if (this.checkedValues?.length) {
            return !this.checkedValues.includes(v.id)
          }
          return true
        }),
      }
      return bindProps
    },
  },
}
</script>
