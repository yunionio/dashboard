<template>
  <a-auto-complete
    :value="value"
    :dataSource="dataSource"
    v-bind="autoCompleteProps"
    @select="emit"
    @focus="onSearch"
    @search="onSearch" />
</template>

<script>
import * as R from 'ramda'
import i18n from '@/locales'
import { objAutoComplete } from '@/utils/utils'

export default {
  name: 'SuggestInput',
  props: {
    value: {
      required: true,
    },
    autoCompleteProps: {
      type: Object,
      default: () => ({ placeholder: i18n.t('common.placeholder') }),
    },
    localData: {
      type: Object,
      default: () => ({}),
    },
    search: {
      type: Function,
    },
    searchMsg: { // 辅助search方法使用，可不穿
      type: String,
    },
  },
  data () {
    return {
      dataSource: [],
    }
  },
  methods: {
    onSearch (value) {
      this.emit(value)
      let opts = objAutoComplete(this.localData, value)
      if (R.is(Function, this.search)) opts = this.search(value, this.searchMsg) || []
      this.dataSource = opts
    },
    emit (value) {
      this.$emit('input', value)
      this.$emit('change', value)
    },
  },
}
</script>
