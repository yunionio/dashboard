import { enumToOptions } from '../../util/util'

export default function (def, schema) {
  def.type = 'j-radio'

  if (schema && schema.enums) {
    def.input = {
      options: enumToOptions(schema.enums),
    }
  }

  def.decorator = [
    {
      rules: [
        {
          validator: this.handleFieldValidate,
        },
      ],
    },
  ]
}
