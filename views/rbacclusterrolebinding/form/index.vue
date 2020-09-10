<template>
  <div class="k8s-deployment-create w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" :clusterObj.sync="clusterObj" />
      </a-form-item>
      <a-form-item label="集群角色">
        <base-select
          :resource="'rbacclusterroles'"
          version="v1"
          :params="clusterRoleparams"
          need-params
          idKey="name"
          :select-props="{ placeholder: $t('common.select') }"
          v-decorator="decorators.role" />
      </a-form-item>
      <a-form-item label="Subject">
        <a-radio-group v-decorator="decorators.subjectType" @change="subjectTypeChange">
          <a-radio-button v-for="item in subjectOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('k8s.text_23')" v-if="subjectType === 'ServiceAccount'">
        <namespace-select v-decorator="decorators.namespace" :cluster="cluster" :namespaceObj.sync="namespaceObj" />
      </a-form-item>
      <a-form-item label="Subject Name">
        <base-select
          v-if="subjectType === 'ServiceAccount'"
          v-decorator="decorators.subject"
          resource="serviceaccounts"
          version="v1"
          idKey="name"
          :params="params"
          need-params
          :select-props="{ placeholder: $t('common.select') }" />
        <a-input v-else v-decorator="decorators.subject" :placeholder="$t('common.placeholder')" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import k8sCreateMixin from '@K8S/mixins/create'

const API_GROUP = 'rbac.authorization.k8s.io'

export default {
  name: 'K8sRbacroleFormCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
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
        namespace: [
          'namespace',
          {
            initialValue: this.$store.state.common.k8s.namespace,
            rules: [
              { required: true, message: this.$t('k8s.text_61'), trigger: 'blur' },
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
      clusterObj: {},
      namespaceObj: {},
      subjectOpts: [
        { key: 'User', label: 'User' },
        { key: 'Group', label: 'Group' },
        { key: 'ServiceAccount', label: '服务账户' },
      ],
      subjectType: 'User',
    }
  },
  computed: {
    clusterRoleparams () {
      const cluster = this.clusterObj.id
      if (!cluster) return {}
      const params = {
        cluster,
        limit: 0,
        scope: this.$store.getters.scope,
      }
      return params
    },
    params () {
      const cluster = this.clusterObj.id
      const namespace = this.namespaceObj.id
      if (!cluster || !namespace) return {}
      const params = {
        cluster,
        namespace,
        limit: 0,
        scope: this.$store.getters.scope,
      }
      return params
    },
  },
  methods: {
    subjectTypeChange (e) {
      this.subjectType = e.target.value
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
        }]
        if (subjects[0].kind === 'ServiceAccount') {
          subjects[0].namespace = this.namespaceObj.name
        } else {
          subjects[0].apiGroup = API_GROUP
        }
        const data = {
          cluster_id: values.cluster,
          name: values.name,
          roleRef: {
            kind: 'ClusterRole',
            name: values.role,
            apiGroup: API_GROUP,
          },
          subjects,
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
