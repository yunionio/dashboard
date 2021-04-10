import moment from 'moment'
const DATE_TYPE_ENUM = 'date,date-time,time'

export default function (def, schema) {
  const type = schema.type
  let format = schema.format

  if (type === 'string' && (format && DATE_TYPE_ENUM.indexOf(format) > -1)) {
    def.type = 'j-date-time-picker'
    let momentFormat = ''

    switch (format) {
      case 'date-time':
        momentFormat = 'YYYY-MM-DD HH:mm:ss'
        break
      case 'time':
        momentFormat = 'HH:mm:ss'
        break
      default:
        format = 'date'
        momentFormat = 'YYYY-MM-DD'
    }

    def.input = {
      type: format,
      format: momentFormat,
    }

    const initialValue = schema.default ? moment(schema.default) : undefined

    def.decorator = [
      {
        initialValue,
        rules: [
          {
            validator: this.handleFieldValidate,
          },
        ],
      },
    ]
  }
}
