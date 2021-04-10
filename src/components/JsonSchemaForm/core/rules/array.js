export default function (def, schema, options) {
  const type = schema.type

  delete options.parentType
  delete options.col

  if (type === 'array') {
    def.type = 'j-list'

    const path = options.path.slice()
    path.push('0')

    if (schema.items) {
      def.items = []
      this._parse('', schema.items, def.items, {
        path: path,
        lookup: options.lookup,
        parentType: 'array',
        parent: def,
      })
    }
  }
}
