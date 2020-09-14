<template>
  <div class="k8s-deployment-create w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_23')">
        <base-select
          resource="federatednamespaces"
          version="v1"
          v-decorator="decorators.federatednamespace_id"
          :params="federatednamespaceParams" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_386')">
        <role-rule-form-item ref="roleRuleRef" federatedResource="federatedroles" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import RoleRuleFormItem from '@K8S/sections/RoleRuleFormItem'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'K8sFederatedRoleFormCreate',
  components: {
    RoleRuleFormItem,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('k8s.text_60') },
              { min: 2, max: 24, message: this.$t('k8s.text_132'), trigger: 'blur' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        federatednamespace_id: [
          'federatednamespace_id',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_61'), trigger: 'blur' },
            ],
          },
        ],
      },
      federatednamespaceParams: {
        scope: this.$store.getters.scope,
        limit: 0,
      },
    }
  },
  methods: {
    async validateForm () {
      try {
        const [roleRuleData, values] = await Promise.all([this.$refs.roleRuleRef.validateForm(), this.form.fc.validateFields()])
        return {
          spec: {
            template: roleRuleData,
          },
          ...values,
        }
      } catch (error) {
        throw error
      }
    },
    async doCreate () {
      try {
        const values = await this.validateForm()
        this.$emit('submit', values)
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
