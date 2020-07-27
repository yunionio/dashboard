<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title || $t('k8s.text_49') }}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('k8s.text_50')">
          <a-input v-decorator="decorators.name" :placeholder="$t('k8s.text_51')" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_19')">
          <cluster-select v-decorator="decorators.cluster" :setDefault="false" :disabled="true" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_23')">
          <namespace-select v-decorator="decorators.namespace" :cluster="params.cluster" :setDefault="false" :disabled="true" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_52')" prop="server">
          <a-input v-decorator="decorators.server" :placeholder="$t('k8s.text_53')" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_54')">
          <a-input v-decorator="decorators.user" :placeholder="$t('k8s.text_55')" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_56')">
          <a-input-password v-decorator="decorators.password" :placeholder="$t('k8s.text_57')" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_58')">
          <a-input v-decorator="decorators.email" :placeholder="$t('k8s.text_59')" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import { SECRET_DEFAULT_TYPE } from '@K8S/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
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
  name: 'K8SImageSecretCreateDialog',
  components: {
    ClusterSelect,
    NamespaceSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('k8s.text_60') },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            initialValue: this.params.cluster,
            rules: [
              { required: true, message: this.$t('k8s.text_30'), trigger: 'blur' },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            initialValue: this.params.namespace,
            rules: [
              { required: true, message: this.$t('k8s.text_61'), trigger: 'blur' },
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
              { required: true, message: this.$t('k8s.text_62'), trigger: 'blur' },
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
        email: [
          'email',
          {
            rules: [
              { validator: validateEmail, trigger: 'blur' },
            ],
          },
        ],
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
  created () {
    this.secretsM = new this.$Manager('secrets', 'v1')
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async doCreate (values) {
      const data = {
        cluster: values.cluster,
        dockerConfigJson: {
          email: values.email,
          password: values.password,
          user: values.user,
          server: values.server,
        },
        name: values.name,
        namespace: values.namespace,
        type: SECRET_DEFAULT_TYPE,
      }
      try {
        await this.secretsM.create({ data })
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.params.success && this.params.success(values.name)
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
