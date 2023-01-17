import _ from 'lodash'
import FormMixin from '../mixins'

const Control = {
  name: 'JControl',
  mixins: [FormMixin],
  computed: {
    groupProps () {
      const { definition } = this
      const component = definition.type
      const groupProps = {
        props: definition.formItem,
      }
      if (component === 'j-fieldset') {
        groupProps.props.labelCol = { span: 24 }
        groupProps.props.wrapperCol = { span: 24 }
      }
      return groupProps
    },
  },
  render (h) {
    const { path, definition } = this
    let component = definition.type
    const componentType = _.get(definition, 'schema.componentType')
    if (componentType) {
      component = `J${componentType}`
    }
    const inputProps = {
      props: {
        ...definition.input,
        path: this.getPath(path),
      },
    }
    if (definition.decorator) {
      const id = this.getDecoratorId(path)
      const decorator = [id].concat(definition.decorator)
      // telegraf 增加默认值
      const pathUrl = path.join('.')
      if (pathUrl === 'virtualMachine.ansiblePlaybook.telegraf.influxdbName') {
        if (inputProps.props &&
          inputProps.props.schema &&
          !inputProps.props.schema.default) {
          inputProps.props.schema.default = 'telegraf'
          decorator[1].initialValue = 'telegraf'
        }
      }
      if (pathUrl === 'virtualMachine.ansiblePlaybook.telegraf.influxdbUrl') {
        if (inputProps.props &&
          inputProps.props.schema &&
          !inputProps.props.schema.default) {
          inputProps.props.schema.default = this.influxdbUrl
          decorator[1].initialValue = this.influxdbUrl
        }
      }
      inputProps.directives = [
        {
          name: 'decorator',
          value: decorator,
        },
      ]
      return (
        <a-form-item { ...this.groupProps }>
          { h(component, inputProps) }
        </a-form-item>
      )
    } else {
      if (definition.formItem && definition.formItem.label) {
        if (component === 'j-fieldset') {
          return (
            <a-card class="mb-2">
              <a-form-item { ...this.groupProps }>
                { h(component, inputProps) }
              </a-form-item>
            </a-card>
          )
        }
        return (
          <a-form-item { ...this.groupProps }>
            { h(component, inputProps) }
          </a-form-item>
        )
      } else {
        return h(component, inputProps)
      }
    }
  },
}

export default Control
