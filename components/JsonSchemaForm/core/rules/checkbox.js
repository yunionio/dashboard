export default function (def) {
  def.type = 'j-checkbox'
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
