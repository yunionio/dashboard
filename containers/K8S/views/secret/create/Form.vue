<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_34')">
        <a-radio-group v-model="form.fd.type">
          <a-radio-button value="keypair">{{$t('k8s.text_332')}}</a-radio-button>
          <a-radio-button value="cephCSI">Ceph CSI</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_23')">
        <namespace-select v-decorator="decorators.namespace" @input="setNamespace" :cluster="cluster" :namespaceObj.sync="namespaceObj" />
      </a-form-item>
      <template v-if="form.fd.type === 'keypair'">
        <a-form-item :label="$t('k8s.text_52')">
          <a-input v-decorator="decorators.server" :placeholder="$t('k8s.text_53')" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_54')">
          <a-input v-decorator="decorators.user" :placeholder="$t('k8s.text_55')" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_56')">
          <a-input v-decorator="decorators.password" :placeholder="$t('k8s.text_57')" show-password />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_58')">
          <a-input v-decorator="decorators.email" :placeholder="$t('k8s.text_59')" />
        </a-form-item>
      </template>
      <template v-else>
        <a-form-item label="UserId">
          <a-input v-decorator="decorators.userId" :placeholder="$t('k8s.text_333')" />
        </a-form-item>
        <a-form-item label="UserKey">
          <a-input v-decorator="decorators.userKey" :placeholder="$t('k8s.text_334')" />
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>

<script>
import _ from 'lodash'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import { SECRET_DEFAULT_TYPE } from '@K8S/constants'
import k8sCreateMixin from '@K8S/mixins/create'
import { REGEXP } from '@/utils/validate'

const validateEmail = (rule, value, cb) => {
  if (!value) {
    cb()
  } else {
    const { regexp, message } = REGEXP.email
    if (regexp.test(value)) {
      cb()
    } else {
      cb(Error(message))
    }
  }
}

export default {
  name: 'K8sConfigmapCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
  },
  mixins: [k8sCreateMixin],
  data () {
    const type = _.get(this.$route, 'query.storageType') || 'keypair'
    return {
      form: {
        fc: this.$form.createForm(this),
        fd: {
          type,
        },
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 16 },
          xl: { span: 18 },
          xxl: { span: 20 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 6 },
          xxl: { span: 4 },
        },
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
              { required: true, message: this.$t('k8s.text_30') },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            initialValue: this.$store.state.common.k8s.namespace,
            rules: [
              { required: true, message: this.$t('k8s.text_61') },
            ],
          },
        ],
        server: [
          'server',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_53'), trigger: 'blur' },
            ],
          },
        ],
        user: [
          'user',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_55'), trigger: 'blur' },
            ],
          },
        ],
        password: [
          'password',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_57'), trigger: 'blur' },
            ],
          },
        ],
        userId: [
          'userId',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_335'), trigger: 'blur' },
            ],
          },
        ],
        userKey: [
          'userKey',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_336'), trigger: 'blur' },
            ],
          },
        ],
        email: [
          'email',
          {
            rules: [
              { validator: validateEmail, trigger: 'blur' },
            ],
          },
        ],
      },
      namespaceObj: {},
    }
  },
  methods: {
    async _doCreate (data, resouce) {
      await new this.$Manager('secrets', 'v1').create({ data })
    },
    async doCreate () {
      try {
        const values = await this.form.fc.validateFields({ scroll: { alignWithTop: true, offsetTop: 100 } })
        const params = {
          name: values.name,
          cluster: values.cluster,
          namespace: values.namespace,
          type: SECRET_DEFAULT_TYPE,
        }
        if (this.form.fd.type === 'keypair') {
          params.dockerConfigJson = {
            email: values.email,
            password: values.password,
            user: values.user,
            server: values.server,
          }
        } else {
          params.type = 'yunion.io/ceph-csi'
          params.cephCSI = {}
          params.cephCSI.userId = values.userId
          params.cephCSI.userKey = values.userKey
        }
        await this._doCreate(params)
        this.$message.success(this.$t('k8s.text_46'))
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
