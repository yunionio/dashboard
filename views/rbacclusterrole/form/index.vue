<template>
  <div class="k8s-deployment-create">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name"  class="w-75" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" :clusterObj.sync="clusterObj"  class="w-75" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_386')">
        <role-rule-form-item ref="roleRuleRef" :clusterId="clusterObj.id" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import RoleRuleFormItem from '@K8S/sections/RoleRuleFormItem'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'K8sRbacroleFormCreate',
  components: {
    ClusterSelect,
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
        cluster: [
          'cluster',
          {
            initialValue: this.$store.state.common.k8s.cluster,
            rules: [
              { required: true, message: this.$t('k8s.text_30'), trigger: 'blur' },
            ],
          },
        ],
      },
      clusterObj: {},
    }
  },
  methods: {
    async validateForm () {
      try {
        const [roleRuleData, values] = await Promise.all([this.$refs.roleRuleRef.validateForm(), this.form.fc.validateFields()])
        return { ...roleRuleData, ...values }
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
