import _ from 'lodash'
import * as R from 'ramda'
import localize from '../validate/localize'
import { parseErrors, removeEmptyValue } from '../util/util'

export default {
  name: 'JsonSchemaForm',
  props: {
    layout: {
      type: String,
      validator: function (value) {
        return ['horizontal', 'inline', 'vertical'].indexOf(value) !== -1
      },
    },
    // form: Object,
    prefixCls: String,
    hideRequiredMark: Boolean,
    hideAction: {
      type: Boolean,
      default: false,
    },
    hideReset: {
      type: Boolean,
      default: true,
    },
    labelCol: {
      type: Object,
      default () {
        return {
          span: 4,
          offset: 0,
        }
      },
    },
    labelAlign: {
      type: String,
      default: 'right',
    },
    wrapperCol: {
      type: Object,
      default () {
        return {
          span: 20,
          offset: 0,
        }
      },
    },
    colon: {
      type: Boolean,
      default: true,
    },
    schema: Object,
    definition: Array,
    defaultValue: [Object, Array],
    extendFd: Object,
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd = { ...this.form.fd, [key]: values[key] }
            })
          },
        }),
        fd: {},
      },
      formDefinition: {
        definition: [],
      },
      model: {
        value: null,
      },
      formScopeparams: {
        scopeParams: {
          scope: this.$store.getters.scope,
        },
      },
    }
  },
  watch: {
    extendFd: {
      handler (fd) {
        if (fd.domain) {
          let domain = fd.domain
          if (R.is(Object, domain) && domain.key) {
            domain = domain.key
          }
          if (this.$store.getters.isAdminMode) {
            delete this.formScopeparams.scopeParams.scope
            this.formScopeparams.scopeParams.project_domain = domain
          } else {
            this.formScopeparams.scopeParams.scope = this.$store.getters.scope
          }
        }
      },
      deep: true,
    },
  },
  provide () {
    return {
      form: this.form.fc,
      formFd: this.form,
      formDefinition: this.formDefinition,
      defaultValue: this.defaultValue,
      model: this.model,
      scopeParams: this.formScopeparams,
    }
  },
  created () {
    const { schema, definition, layout, labelCol, wrapperCol, colon, labelAlign } = this
    let formItemProps = {
      colon,
    }

    if (layout !== 'vertical') {
      this.formItemProps = formItemProps = {
        ...formItemProps,
        labelCol,
        wrapperCol,
        labelAlign,
      }
    }

    // form definition
    this.validate = this.$validator.compile(schema)
    this.formDefinition.definition = this.$generator.parse(schema, definition, formItemProps, this.handleFieldValidate.bind(this))

    this.$watch('schema', (schema) => {
      this.validate = this.$validator.compile(schema)
      this.formDefinition.definition = this.$generator.parse(schema, this.definition, this.formItemProps, this.handleFieldValidate.bind(this))
    }, {
      deep: true,
    })

    this.$watch('definition', (definition) => {
      // this.validate = this.$validator.compile(this.schema)
      this.formDefinition.definition = this.$generator.parse(this.schema, definition, this.formItemProps, this.handleFieldValidate.bind(this))
    }, {
      deep: true,
    })

    this.model.value = this.defaultValue

    this.$watch('defaultValue', (newValue) => {
      this.model.value = newValue
    }, {
      deep: true,
    })
  },
  mounted () {
    const { defaultValue } = this

    if (!_.isEmpty(defaultValue)) {
      this.form.fc.setFieldsValue(defaultValue)
    }
  },
  methods: {
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        return values
      } catch (error) {
        throw error
      }
    },
    handleFieldValidate (rule, value, callback) {
      const { validate, form, schema } = this
      const path = rule.fullField
      const model = form.fc.getFieldsValue()
      // 移除空数据
      removeEmptyValue(model)

      const valid = validate(model)
      let error

      if (!valid) {
        localize(validate.errors, schema)
        const allErrors = parseErrors(validate.errors)

        if (allErrors[path]) {
          error = allErrors[path]
        }

        callback(error)
      } else {
        callback()
      }
    },
    handleClear () {
      this.form.fc.resetFields()
    },
  },
  render (h) {
    const { form, layout, prefixCls, hideRequiredMark } = this

    return (
      <a-form
        form={ form.fc }
        layout={ layout }
        prefixCls={ prefixCls }
        hideRequiredMark={ hideRequiredMark }
      >
        <j-fieldset />
      </a-form>
    )
  },
}
