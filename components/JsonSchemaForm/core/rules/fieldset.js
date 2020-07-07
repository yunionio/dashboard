import _ from 'lodash'

export default function (def, schema, options) {
  const type = schema.type
  const parentType = options.parentType
  delete options.parentType
  delete options.col

  if (type === 'object') {
    if (parentType && parentType === 'array') {
      const size = _.size(schema.properties)
      const itemType = size > 6 ? 'j-fieldset' : 'j-inline'
      let flag = true

      _.each(schema.properties, (val, key) => {
        if (val.type === 'object' || val.type === 'array') {
          flag = false
          return false
        }
      })

      def.type = flag ? itemType : 'j-fieldset'

      if (itemType === 'j-inline') {
        options.col = Math.floor(24 / size)
      }
    } else {
      def.type = 'j-fieldset'
    }

    def.items = []
    const columns = []

    _.each(schema.properties, (val, key) => {
      if (/\./.test(key)) {
        key = [key]
      }

      const path = options.path.slice()
      path.push(key)

      const required = schema.required && _.indexOf(schema.required, key) !== -1

      // options.columns
      if (def.type === 'j-inline') {
        columns.push({
          col: options.col,
          label: val.title || '',
          required,
        })

        val.title = ''
      }

      this._parse(key, val, def.items, {
        ...options,
        path: path,
        required: required,
        lookup: options.lookup,
      })
    })

    if (def.type === 'j-inline') {
      options.parent.columns = columns
    }
  }
}
