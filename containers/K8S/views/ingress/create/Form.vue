<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_23')">
        <namespace-select v-decorator="decorators.namespace" :cluster="cluster" @input="setNamespace" :namespaceObj.sync="namespaceObj" />
      </a-form-item>
      <a-form-item :label="$t('k8s.ingress.className')">
        <a-input v-decorator="decorators.className" :placeholder="$t('k8s.ingress.className.input')" @change="inputClassNameChange" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_14')" required>
        <ingress-rule :decorators="decorators.rule" :namespace="namespaceObj.name" :cluster="cluster"  />
      </a-form-item>
      <div v-if="isNginxClass()">
        <a-form-item :label="$t('network.text_379')">
          <a-switch :disabled="disabled" v-decorator="decorators.stickySession.enabled" @change="stickySessionChange" />
        </a-form-item>
        <div v-if="stickySessionEnabled">
          <a-form-item :label="$t('k8s.ingress.nginx.session-cookie-name')">
            <a-input  v-decorator="decorators.stickySession.name" />
          </a-form-item>
          <a-form-item :label="$t('k8s.ingress.nginx.session-cookie-expires')">
            <a-input  v-decorator="decorators.stickySession.cookieExpires" type="number" />
          </a-form-item>
        </div>
      </div>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import IngressRule from './IngressRule'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import k8sCreateMixin from '@K8S/mixins/create'

const validateValidPath = (rule, value, callback) => {
  if (value.startsWith('/')) {
    callback()
  } else {
    callback(new Error(this.$t('k8s.text_131')))
  }
}

export default {
  name: 'K8sIngressCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    IngressRule,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      inputClassName: 'nginx',
      stickySessionEnabled: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      errPanes: [], // 表单校验错误的tabs
      containerPanes: [], // 子组件同步的tabs
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
        className: [
          'className',
          {
            initialValue: 'nginx',
            rules: [
              { required: true, message: this.$t('k8s.ingress.className.input'), trigger: 'blur' },
            ],
          },
        ],
        rule: {
          host: i => [
            `hosts[${i}]`,
            {
              rules: [
                { required: false, message: this.$t('k8s.text_205'), trigger: 'blur' },
              ],
            },
          ],
          services: i => ({
            serviceName: j => [
              `serviceNames[${i}][${j}]`,
              {
                rules: [
                  { required: true, message: this.$t('k8s.text_206') },
                ],
              },
            ],
            servicePath: j => [
              `servicePaths[${i}][${j}]`,
              {
                validateFirst: true,
                rules: [
                  { required: true, message: this.$t('k8s.text_237'), trigger: 'blur' },
                  { validator: validateValidPath },
                ],
              },
            ],
            servicePort: j => [
              `servicePorts[${i}][${j}]`,
              {
                rules: [
                  { type: 'number', required: true, message: this.$t('k8s.text_207'), trigger: 'blur' },
                ],
              },
            ],
          }),
        },
        stickySession: {
          enabled: [
            'stickySession.enabled',
            {
              valuePropName: 'checked',
            },
          ],
          name: [
            'stickySession.name',
            {
              initialValue: 'stickounet',
            },
          ],
          cookieExpires: [
            'stickySession.cookieExpires',
            {
              initialValue: 1000,
              normalize: v => Number(v),
              rules: [
                { type: 'integer', min: 60, message: this.$t('k8s.ingress.nginx.session-cookie-expires'), trigger: 'blur' },
              ],
            },
          ],
        },
      },
      namespaceObj: {},
    }
  },
  methods: {
    inputClassNameChange (e) {
      this.inputClassName = e.target.value
    },
    isNginxClass () {
      return this.inputClassName === 'nginx'
    },
    stickySessionChange (val) {
      this.stickySessionEnabled = val
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async _doCreate (data) {
      await new this.$Manager('ingresses', 'v1').create({ data })
    },
    async doCreate () {
      try {
        const values = await this.validateForm()
        const rules = []
        R.forEachObjIndexed((value, key) => {
          const item = {
            host: value,
            paths: [],
          }
          R.forEachObjIndexed((val, k) => {
            item.paths.push({
              path: val,
              backend: {
                serviceName: values.serviceNames[key][k],
                servicePort: values.servicePorts[key][k],
              },
            })
          }, values.servicePaths[key])
          rules.push(item)
        }, values.hosts)
        const params = {
          name: values.name,
          cluster: values.cluster,
          namespace: values.namespace,
          ingressClassName: values.className,
          stickySession: values.stickySession,
          rules,
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
