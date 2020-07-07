import extend from 'extend'
import objectpath from 'objectpath'

export default function (name, schema = {}, options, props = {}) {
  const def = {
    key: options.path,
  }
  props = extend(true, {}, props)
  const formItemProps = {
    ...props,
    label: schema.title || '',
  }

  if (formItemProps.label === '' && formItemProps.wrapperCol) {
    formItemProps.wrapperCol.span = formItemProps.wrapperCol.span + formItemProps.labelCol.span + formItemProps.labelCol.offset
  }

  if (schema.description) {
    formItemProps.help = schema.description
  }

  if (options.required) {
    formItemProps.required = true
  }

  if (options.col) {
    def.col = options.col
  }

  def.formItem = formItemProps
  def.schema = schema
  options.lookup[objectpath.stringify(options.path)] = def

  return def
}
