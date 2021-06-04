<template>
  <component
    ref="usage"
    :is="type"
    :visible.sync="visible"
    :formItemLayout="formItemLayout"
    :options="options"
    @update="update"
    :params="params"
    :edit="edit">
    <a-row class="mb-4">
      <a-col :span="formItemLayout.labelCol.span" class="ant-form-item-label">
        <label>{{$t('dashboard.text_24')}}</label>
      </a-col>
      <a-col :span="formItemLayout.wrapperCol.span">
        <a-radio-group v-model="type" @change="typeChange">
          <a-radio-button v-for="item in typeOpts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <template v-slot:actions="{ handleEdit }"><slot name="actions" :handleEdit="handleEdit" /></template>
  </component>
</template>

<script>
import Resource from './components/Resource'
import Brand from './components/Brand'
// import { hasSetupKey } from '@/utils/auth'

export default {
  name: 'ConsumptionPercent',
  components: {
    Resource,
    Brand,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
  },
  data () {
    const typeOps = []
    typeOps.push({ key: 'Resource', label: this.$t('dashboard.resource_type_consumption_percent') })
    typeOps.push({ key: 'Brand', label: this.$t('dashboard.brand_consumption_percent') })
    return {
      type: (this.params && this.params.type) || 'Resource',
      typeOpts: typeOps,
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      visible: false,
    }
  },
  watch: {
    visible (v) {
      if (!v) { // 当关闭抽屉的时候重置type
        this.type = (this.params && this.params.type) || 'Resource'
      }
    },
  },
  methods: {
    typeChange () {
      this.visible = true
    },
    refresh () {
      return this.$refs.usage.refresh()
    },
    update (...ret) {
      this.$emit('update', ...ret)
    },
  },
}
</script>
