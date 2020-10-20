<template>
  <component
    ref="usage"
    :is="type"
    :visible.sync="visible"
    :formItemLayout="formItemLayout"
    :options="options"
    @update="update"
    :params="params"
    :type="type">
    <a-row class="mb-4">
      <a-col :span="formItemLayout.labelCol.span" class="ant-form-item-label">
        <label>{{$t('dashboard.text_24')}}</label>
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
import ProjectQuotaCommon from './components/Common'
import ProjectQuotaImage from './components/Image'
import ProjectQuotaRegion from './components/Region'

export default {
  name: 'ProjectQuota',
  components: {
    ProjectQuotaCommon,
    ProjectQuotaImage,
    ProjectQuotaRegion,
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
      type: (this.params && this.params.type) || 'project-quota-common',
      typeOpts: [
        { key: 'project-quota-common', label: '默认' },
        { key: 'project-quota-image', label: '镜像' },
        { key: 'project-quota-region', label: '区域' },
      ],
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
  methods: {
    refresh () {
      return this.$refs.usage.refresh()
    },
    update (...ret) {
      this.$emit('update', ...ret)
    },
  },
}
</script>
