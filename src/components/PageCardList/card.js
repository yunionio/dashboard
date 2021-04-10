import * as R from 'ramda'
import _ from 'lodash'

export default {
  methods: {
    getOptions (item, type) {
      if (!this.singleActions) return []
      if (type === 'primaryActions') {
        return this.singleActions.filter(val => {
          return R.is(Function, val.meta) && val.meta(item).buttonType === 'primary'
        })
      } else if (type === 'singleActions') {
        return [
          {
            actions: () => {
              return this.singleActions.filter(val => {
                return !(R.is(Function, val.meta) && val.meta(item).buttonType === 'primary')
              })
            },
          },
        ]
      }
    },
    getData (data, item) {
      const field = this.cardFields[item]
      if (R.is(Function, field)) {
        return field(data)
      }
      if (R.is(Array, field) && field.length) {
        const arr = []
        field.map(item => {
          const obj = {
            value: data[item.field],
            title: item.title,
            field: item.field,
          }
          if (item.formatter) {
            obj.value = item.formatter(data)
          }
          if (item.slots) {
            obj.slots = item.slots
          }
          arr.push(obj)
        })
        return arr
      }
      if (R.is(Object, field)) {
        if (field.formatter) {
          return field.formatter(data)
        }
      }
      return _.get(data, field) || ''
    },
    imgError (item, ref) {
      if (this.$refs[ref] && this.$refs[ref][0]) this.$refs[ref][0].src = this.imageDefault
    },
    showSingleActions (item) {
      const show = this.getOptions(item, 'singleActions')
      if (show && show.length && show[0].actions().length === 0) {
        return false
      }
      return true
    },
    getDom (value, data) {
      if (value.slots) {
        return value.slots(data)
      }
      const text = value.value
      return (<span>
        {{ text }}
      </span>)
    },
  },
}
