<template>
  <a-form
    :form="form.fc">
    <a-form-item label="名称" v-bind="formItemLayout" help="" :extra="$t('validator.resourceName')">
      <a-input v-decorator="decorators.name" placeholder="请输入名称" />
    </a-form-item>
    <a-form-item label="描述" v-bind="formItemLayout">
      <a-textarea v-decorator="decorators.description" placeholder="长度限制为0-128个字符，详细的描述总能让人更快的了解服务" />
    </a-form-item>
    <a-form-item label="主机模板" v-bind="formItemLayout">
      <base-select
        filterable
        :isDefaultSelect="true"
        :params="servertemplateParams"
        resource="servertemplates"
        v-decorator="decorators.guest_template" />
    </a-form-item>
    <a-form-item label="图标URL" v-bind="formItemLayout">
      <a-input v-decorator="decorators.icon_url" placeholder="请输入URL" />
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'ServicecatalogForm',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    servertemplateParams () {
      return {
        limit: 0,
        project: this.$store.getters.userInfo.projectId,
      }
    },
  },
  methods: {
    async validateFields () {
      try {
        const values = await this.form.fc.validateFields()
        return values
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style>

</style>
