export default function (def, schema) {
  const type = schema.type

  if (type === 'string') {
    def.type = 'a-input'
    def.decorator = [
      {
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
