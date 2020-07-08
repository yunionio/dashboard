import { DatePicker, TimePicker } from 'ant-design-vue'
import DateTimePicker from './Datetime'

/* istanbul ignore next */
DateTimePicker.install = function (Vue) {
  Vue.use(DatePicker)
  Vue.use(TimePicker)
  Vue.component(DateTimePicker.name, DateTimePicker)
}

export default DateTimePicker
