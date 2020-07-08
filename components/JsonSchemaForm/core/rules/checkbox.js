export default function (def, schema) {
  def.type = 'j-checkbox'
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
