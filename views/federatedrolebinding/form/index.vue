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
          idKey="name"
          v-decorator="decorators.federatednamespace"
          :params="federatednamespaceParams" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_389')">
        <a-radio-group v-decorator="decorators.roleRefType" @change="e => roleRefType = e.target.value">
          <a-radio-button v-for="item in roleRefOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="roleLabel">
        <base-select
          :resource="roleRefType === 'Role' ? 'federatedroles' : 'federatedclusterroles'"
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
  name: 'K8sRbacroleFormCreate',
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
        federatednamespace: [
          'federatednamespace',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_61'), trigger: 'blur' },
            ],
          },
        ],
        roleRefType: [
          'roleRefType',
          {
            initialValue: 'Role',
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
      roleRefType: 'Role',
      subjectType: 'User',
      federatednamespaceParams: {
        scope: this.$store.getters.scope,
        limit: 0,
      },
      params: {
        limit: 0,
        scope: this.$store.getters.scope,
      },
    }
  },
  computed: {
    roleLabel () {
      return this.roleRefType === 'Role' ? this.$t('k8s.text_370') : this.$t('k8s.text_373')
    },
  },
  created () {
    this.getSubjectOpts()
  },
  methods: {
    async getSubjectOpts () {
      try {
        let spec = ''
        if (this.subjectType === 'User') spec = 'cluster-users'
        if (this.subjectType === 'Group') spec = 'cluster-user-groups'
        const { data } = await new this.$Manager('federatedroles', 'v1').get({ id: spec })
        this.subjectOpts = data
      } catch (error) {
        throw error
      }
    },
    subjectTypeChange (e) {
      this.subjectType = e.target.value
      this.getSubjectOpts()
      this.form.fc.setFieldsValue({
        [this.decorators.subject[0]]: undefined,
      })
    },
    async validateForm () {
      try {
        const values = await this.form.fc.validateFields()
        const subjects = [{
          kind: values.subjectType,
          name: values.subject,
          apiGroup: API_GROUP,
          namespace: values.federatednamespace,
        }]
        const data = {
          name: values.name,
          federatednamespace_id: values.federatednamespace,
          spec: {
            template: {
              roleRef: {
                kind: values.roleRefType,
                name: values.role,
                apiGroup: API_GROUP,
              },
              subjects,
            },
          },
        }
        console.log(data, 'data')
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
