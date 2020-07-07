import _ from 'lodash'
import extend from 'extend'
import objectpath from 'objectpath'
import rule from './rule'
import defaultRule from './rules/default'
import arrayRule from './rules/array'
import switchRule from './rules/switch'
import checkboxesRule from './rules/checkboxes'
import dateRule from './rules/date'
import fieldsetRule from './rules/fieldset'
import numberRule from './rules/number'
import selectRule from './rules/select'
import textRule from './rules/text'

const rulesMap = {
  switch: switchRule,
  fieldset: fieldsetRule,
  checkboxes: checkboxesRule,
  list: arrayRule,
  digit: numberRule,
  date: dateRule,
  select: selectRule,
  text: textRule,
}

const layoutComponents = ['list', 'fieldset']

const TYPE_MAP = {
  text: 'text',
  select: 'select',
  textarea: 'a-textarea',
  html: 'j-html',
  fieldset: 'j-fieldset',
  array: 'j-list',
  'v-fieldset': 'j-fieldset',
  number: 'digit',
  integer: 'digit',
}

class Generator {
  constructor () {
    this.rules = {}
    this.init()
  }

  init () {
    const rules = {}

    _.each(rule, (list, type) => {
      rules[type] = list.map(item => {
        if (_.indexOf(layoutComponents, item) === -1) {
          rules[item] = [rulesMap[item]]
        }

        return rulesMap[item]
      })
    })
    this.rules = rules
  }

  /**
   * 给指定类型添加规则
   * @param {String} type data type
   * @param {Function} rule 规则
   * @param {Number} idx 添加位置，不提供则是添加到第一位
   */
  addRule (type, rule, idx = 0) {
    const rules = this.rules[type]

    if (!rules) {
      this.rules[type] = [rule]
      // throw new Error(`不支持的类型: ${type}`)
    } else {
      rules.splice(idx, 0, rule)
    }
  }

  /**
   * 生成表单模型
   * @param {Object} schema
   * @param {Array} definition
   */
  parse (_schema, definition = [], formItemProps, handleFieldValidate) {
    if (!_schema || !(_schema.properties || _schema.items)) {
      throw new Error('schema no validate!')
    }

    const schema = extend(true, {}, _schema)

    this.handleFieldValidate = handleFieldValidate
    this.formItemProps = formItemProps

    const options = { path: [], lookup: {} }
    const schemaForm = []

    if (schema.properties) {
      _.each(schema.properties, (val, key) => {
        const required = schema.required && _.indexOf(schema.required, key) !== -1
        this._parse(key, val, schemaForm, {
          path: [key],
          required: required,
          lookup: options.lookup,
        })
      })
    } else {
      this._parse('', schema, schemaForm, {
        path: [],
        lookup: options.lookup,
      })
    }
    // 再根据form definition合并form schema
    if (definition.length) {
      definition = combine.call(this, definition, schemaForm, options.lookup)
    } else {
      definition = schemaForm
    }
    return definition
  }

  /**
   * 生成表单模型
   * @param {Object} schema
   * @param {Array} definition
   */
  _parse (name, schema, definition, options) {
    const rules = this.rules[schema.type]
    let def

    if (rules) {
      def = defaultRule(name, schema, options, this.formItemProps)
      for (let i = 0, len = rules.length; i < len; i++) {
        rules[i].call(this, def, schema, options)

        if (def.type) {
          break
        }
      }
    }

    definition.push(def)
  }
}

/**
 * 合并form definition & schemaForm
 * @param {Object} form 外部传递的 definition
 * @param {Array} schemaForm 根据 jsonSchema 生成
 * @param {Array} lookup
 */
function combine (form, schemaForm, lookup) {
  const idx = _.indexOf(form, '*')

  // 用schema生成的默认定义
  if (idx === 0) {
    return schemaForm
  }

  // Important: 存在*就意味着使用schema生成的默认定义，只是在前后做一定的扩展，如果此时存在同名定义，就会存在两个定义。
  if (idx > -1) {
    form.splice(idx, 1)
  }

  const definition = []
  _.each(form, obj => {
    if (typeof obj === 'string') {
      obj = {
        key: obj,
      }
    }

    if (obj.key && typeof obj.key === 'string') {
      obj.key = obj.key.replace(/\[\]/g, '[0]')
      obj.key = objectpath.parse(obj.key)
    }

    // 兼容jsonschema-form-vue definition格式
    obj = compatOldVersion(obj)

    // if (def.options) {
    //   def.options = formatOptions(obj.options)
    // }
    let def

    // extend with schema form from schema
    if (obj.key) {
      const path = objectpath.stringify(obj.key)
      def = lookup[path]
      if (def) {
        if (TYPE_MAP[obj.type]) {
          obj.type = TYPE_MAP[obj.type]
        }

        // 当类型不相等，要处理，获取正确def
        if (obj.type && def.type !== obj.type) {
          const rule = this.rules[obj.type]

          if (rule) {
            const _def = {
              formItem: def.formItem,
              key: def.key,
              col: def.col,
              schema: def.schema,
            }

            rule[0].call(this, _def, _def.schema)
            obj.type = _def.type
            delete _def.schema
            obj = extend(true, {}, _def, obj)
            delete def.decorator
            obj = extend(true, {}, def, obj)
          } else {
            obj = extend(true, {}, def, obj)
          }
        } else {
          obj = extend(true, {}, def, obj)
        }

        // wrapper col span
        if (def.formItem.label !== obj.formItem.label && (def.formItem.label === '' || obj.formItem.label === '')) {
          if (def.formItem.label === '') {
            obj.formItem.wrapperCol.span = obj.formItem.wrapperCol.span - obj.formItem.labelCol.span - obj.formItem.labelCol.offset
          } else {
            obj.formItem.wrapperCol.span = obj.formItem.wrapperCol.span + obj.formItem.labelCol.span + obj.formItem.labelCol.offset
          }
        }
      } else {
        const rule = this.rules[obj.type]

        if (rule) {
          def = {
            formItem: {
              ...this.formItemProps,
            },
          }

          rule[0].call(this, def)
          obj.type = def.type
          obj = extend(true, {}, def, obj)
        }
      }

      delete lookup[path]
    }

    if (obj.items) {
      if (def) {
        obj.items = combine.call(this, obj.items, def.items, lookup)
      } else {
        obj.items = combine.call(this, obj.items, schemaForm, lookup)
      }
    }
    definition.push(obj)
  })

  if (idx > -1 && !_.isEmpty(lookup)) {
    const defaultDefinitions = []

    for (const path in lookup) {
      defaultDefinitions.push(lookup[path])
    }

    definition.splice(idx, 0, ...defaultDefinitions)
  }

  return definition
}

// 兼容jsonschema-form-vue definition结构
function compatOldVersion (data) {
  const def = extend(true, {}, data)
  const obj = {
    type: def.type,
    key: def.key,
  }
  delete def.type
  delete def.key
  let formItem = {}
  let input = {}

  if (typeof def.title !== 'undefined') {
    formItem.label = def.title
    delete def.title
  }

  if (def.description) {
    formItem.help = def.description
    delete def.description
  }

  if (def.col) {
    obj.col = def.col
    delete def.col
  }

  if (def.tpl) {
    input.html = def.tpl
    delete def.tpl
  }

  if (def.items) {
    obj.items = _.cloneDeep(def.items)
    delete def.items
  }

  formItem = extend(true, {}, formItem, def.formItem)
  delete def.formItem
  input = extend(true, {}, input, def.input)
  delete def.formItem

  input = {
    ...input,
    ...def,
  }

  obj.formItem = formItem
  obj.input = input

  return obj
}

export default Generator
