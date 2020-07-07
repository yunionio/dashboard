export default function (def, schema) {
  const type = schema.type

  if (type === 'number' || type === 'integer') {
    def.type = 'a-input-number'
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
