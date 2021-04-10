import { enumToOptions } from '../../util/util'

export default function (def, schema) {
  const type = schema.type

  if (type === 'string' && schema.enum) {
    def.type = 'a-select'
    def.input = {
      options: enumToOptions(schema.enum),
    }
    def.decorator = [
      {
        initialValue: schema.default,
        rules: [
          {
            validator: this.handleFieldValidate,
          },
        ],
      },
    ]
  }
}
