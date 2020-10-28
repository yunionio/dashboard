<template>
  <div class="k8s-deployment-create w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_373')">
        <base-select
          resource="federatedclusterroles"
          version="v1"
          :params="params"
          need-params
          idKey="name"
          :select-props="{ placeholder: $t('common.select') }"
          v-decorator="decorators.role" />
      </a-form-item>
      <a-form-item label="Subject">
        <a-radio-group v-decorator="decorators.subjectType" @change="subjectTypeChange">
          <a-radio-button v-for="item in subjectTypeOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="Subject Name">
        <base-select
          v-if="subjectOpts.length"
          v-decorator="decorators.subject"
          :options="subjectOpts"
          version="v1"
          idKey="name"
          :select-props="{ placeholder: $t('common.select') }" />
        <a-input v-else v-decorator="decorators.subject" :placeholder="$t('common.placeholder')" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import k8sCreateMixin from '@K8S/mixins/create'

const API_GROUP = 'rbac.authorization.k8s.io'

export default {
  name: 'K8sFederatedClusterRolebindingFormCreate',
  components: {
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
        role: [
          'role',
          {
            rules: [
              { required: true, message: this.$t('common.select'), trigger: 'blur' },
            ],
          },
        ],
        subjectType: [
          'subjectType',
          {
            initialValue: 'User',
          },
        ],
        subject: [
          'subject',
          {
            rules: [
              { required: true, message: this.$t('common.select'), trigger: 'blur' },
            ],
          },
        ],
      },
      roleRefOpts: [
        { key: 'Role', label: this.$t('k8s.text_370') },
        { key: 'ClusterRole', label: this.$t('k8s.text_373') },
      ],
      subjectTypeOpts: [
        { key: 'User', label: 'User' },
        { key: 'Group', label: 'Group' },
      ],
      subjectOpts: [],
      subjectType: 'User',
      params: {
        limit: 0,
        scope: this.$store.getters.scope,
      },
    }
  },
  created () {
    this.getSubjectOpts()
  },
  methods: {
    subjectTypeChange (e) {
      this.subjectType = e.target.value
      this.getSubjectOpts()
      this.form.fc.setFieldsValue({
        [this.decorators.subject[0]]: undefined,
      })
    },
    async getSubjectOpts () {
      try {
        let spec = ''
        if (this.subjectType === 'User') spec = 'cluster-users'
        if (this.subjectType === 'Group') spec = 'cluster-user-groups'
        const { data } = await new this.$Manager('federatedclusterroles', 'v1').get({ id: spec, params: { scope: this.$store.getters.scope } })
        this.subjectOpts = data
      } catch (error) {
        throw error
      }
    },
    async validateForm () {
      try {
        const values = await this.form.fc.validateFields()
        const subjects = [{
          kind: values.subjectType,
          name: values.subject,
          apiGroup: API_GROUP,
        }]
        const data = {
          name: values.name,
          spec: {
            template: {
              roleRef: {
                kind: 'ClusterRole',
                name: values.role,
                apiGroup: API_GROUP,
              },
              subjects,
            },
          },
        }
        return data
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
