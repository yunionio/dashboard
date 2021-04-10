import * as R from 'ramda'

export default function (def, schema) {
  const type = schema.type
  if (type === 'number' || type === 'integer') {
    def.type = 'a-input-number'
    def.decorator = [
      {
        initialValue: schema.default,
        rules: [
          {
            validator: this.handleFieldValidate,
          },
        ],
        validateTrigger: 'blur',
        normalize: (val, oldV) => {
          if (R.is(Number, +val)) return +val
          return oldV
        },
      },
    ]
  }
}
