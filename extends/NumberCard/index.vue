<template>
  <component
    :is="type"
    :type="type"
    :visible.sync="visible"
    :formItemLayout="formItemLayout"
    :options="options"
    @update="update"
    :params="params">
    <a-row class="mb-4">
      <a-col :span="formItemLayout.labelCol.span" class="ant-form-item-label">
        <label>类型</label>
      </a-col>
      <a-col :span="formItemLayout.wrapperCol.span">
        <a-radio-group v-model="type">
          <a-radio-button v-for="item in typeOpts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <template v-slot:actions="{ handleEdit }"><slot name="actions" :handleEdit="handleEdit" /></template>
  </component>
</template>

<script>
import Server from './components/Server'
import K8s from './components/K8s'

export const options = {
  label: '数字图',
  desc: '某项指标的统计数字',
  icon: 'dashboard-number',
  h: 2,
  w: 5,
  sort: 1,
}

export default {
  name: 'NumberCard',
  components: {
    Server,
    K8s,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
  },
  data () {
    return {
      type: (this.params && this.params.type) || 'server',
      typeOpts: [
        { key: 'server', label: '主机资源' },
        { key: 'k8s', label: '容器资源' },
      ],
      visible: false,
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  methods: {
    update (...ret) {
      this.$emit('update', ...ret)
    },
  },
}
</script>
