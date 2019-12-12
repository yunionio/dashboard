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
        fc: this.$form.createForm(this),
      },
      keySecretFieldInit: keySecretFields[this.provider.toLowerCase()],
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 3 },
          xxl: { span: 2 },
        },
      },
      domainProjectShow: false,
    }
  },
  computed: {
    keySecretField () {
      return keySecretFields[this.provider.toLowerCase()]
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
  },
}
