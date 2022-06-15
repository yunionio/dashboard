<template>
  <div v-on="events" tabindex="1" class="d-flex align-items-center list-body-cell-wrap" :title="message || row[field] || '-'">
    <span v-if="showType === 'text'" class="text-truncate">{{time || '-'}} <a-icon v-if="edit" type="edit" class="primary-color" /></span>
    <a-date-picker
      style="width: 100%"
      v-if="showType === 'select'"
      v-model="time"
      show-time
      :format="format"
      :valueFormat="format"
      :show-today="false"
      :disabled-date="disabledDate"
      @ok="handleSelect" />
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'ListCellTimeSelect',
  props: {
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss',
    },
    row: { // 当前行数据
      type: Object,
    },
    message: String,
    field: {
      type: String,
      default: 'name',
    },
    edit: {
      type: Boolean,
      default: true,
    },
    timeDisabled: {
      type: String, // afterCurrent beforeCurrent
    },
  },
  data () {
    return {
      time: '',
      showType: 'text', // text, select
    }
  },
  created () {
    this.initTime()
    this.events = {}
    this.events.click = this.handleClick
  },
  methods: {
    initTime () {
      const time = _.get(this.row, this.field)
      this.time = time ? this.$moment(time).format(this.format) : ''
    },
    disabledDate (current) {
      if (this.timeDisabled === 'afterCurrent') {
        return current && current > this.$moment()
      }
      if (this.timeDisabled === 'beforeCurrent') {
        return current && current < this.$moment()
      }
      return false
    },
    handleClick (e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.showType === 'text' && this.edit) this.showType = 'select'
    },
    handleSelect (date) {
      if (this.showType === 'select') this.showType = 'text'
      this.$emit('change', { row: this.row, field: this.field, value: date })
    },
  },
}
</script>
