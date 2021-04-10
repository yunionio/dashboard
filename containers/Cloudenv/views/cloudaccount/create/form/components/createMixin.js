import * as R from 'ramda'
import { keySecretFields } from '@Cloudenv/views/cloudaccount/constants'

export default {
  props: {
    provider: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.handleValuesChange,
        }),
        fd: {
          domain: '',
        },
      },
      keySecretFieldInit: keySecretFields[this.provider.toLowerCase()],
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      domainProjectShow: false,
    }
  },
  computed: {
    keySecretField () {
      return keySecretFields[this.provider.toLowerCase()]
    },
    isAliyun () {
      return this.provider.toLowerCase() === 'aliyun'
    },
  },
  watch: {
    provider (val) {
      this.decorators = this.getDecorators()
    },
  },
  activated () { // 使 DomainProject 组件避免被缓存住
    this.domainProjectShow = true
  },
  deactivated () {
    this.domainProjectShow = false
    if (this.keepAliveFields) return
    this.form.fc.resetFields()
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) {
            reject(err)
          } else {
            const params = {}
            R.forEachObjIndexed((value, key) => {
              if (R.is(String, value)) {
                params[key] = value.trim()
              } else {
                params[key] = value
              }
            }, values)
            resolve(params)
          }
        })
      })
    },
    project_change () {
      const proxySettingref = this.$refs.proxySetting
      if (proxySettingref && proxySettingref.fetchQueryProxy) {
        // 根据域获取代理列表信息
        proxySettingref.fetchQueryProxy()
      }
    },
    async handleValuesChange (vm, changedFields) {
      await this.$nextTick()
      const fields = Object.keys(changedFields)
      if (changedFields && fields.length > 0) {
        fields.forEach(field => {
          if (changedFields.hasOwnProperty('domain')) {
            this.form.fd[field] = changedFields[field]
          }
          const fn = this[`${field}_change`]
          if (fn && typeof fn === 'function') {
            fn()
          }
        })
      }
    },
  },
}
