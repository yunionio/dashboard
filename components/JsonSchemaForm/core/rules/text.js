export default function (def, schema) {
  const type = schema.type

  if (type === 'string') {
    def.type = 'a-input'
    def.decorator = [
      {
        initialValue: schema.default,
        rules: [
          {
            validator: this.handleFieldValidate,
          },
        ],
        validateTrigger: 'blur',
      },
    ]
  }
}
