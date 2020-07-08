import * as R from 'ramda'
import { enumToOptions } from '../../util/util'

export default function (def, schema) {
  const type = schema.type

  if (type === 'array' && schema.items && schema.items.enum) {
    def.type = 'a-checkbox-group'
    def.input = {
      options: enumToOptions(schema.items.enum),
    }
    let initialValue = schema.default
    if (R.is(String, initialValue)) {
      initialValue = initialValue.split(',')
    }
    def.decorator = [
      {
        initialValue,
        rules: [
          {
            validator: this.handleFieldValidate,
          },
        ],
      },
    ]

    if (def.required && !schema.minItems) {
      schema.minItems = 1
    }
  }
}
