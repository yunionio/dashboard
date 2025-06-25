<template>
  <div>
    <a-form-item :label="$t('network_waf_statement.label.match_field')" v-bind="formLayout">
      <a-select v-if="isEdit" v-model="value">
        <a-select-option v-for="item in matchFieldOptions" :value="item.value" :key="item.value">
          {{item.label}}
        </a-select-option>
      </a-select>
      <box-show v-else :value="showValue" />
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import BoxShow from './BoxShow'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MatchFieldStatement',
  components: {
    BoxShow,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    isEdit: Boolean,
    type: String,
    value: String,
  },
  data () {
    return {
      formLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    matchFieldOptions () {
      // 根据不同type返回
      return [
        { label: 'RequestBody', value: 'Body' },
        { label: 'JsonBody', value: 'JsonBody' },
        { label: 'QueryString', value: 'Query' },
        { label: 'RequestMethod', value: 'Method' },
        { label: 'RequestHeaders', value: 'Header' },
        { label: 'URI path', value: 'UriPath' },
        { label: 'PostArgs', value: 'PostArgs' },
        { label: 'RequestCookies', value: 'Cookie' },
        { label: 'RemoteAddr', value: 'RemoteAddr' },
      ]
    },
    showValue () {
      const matchField = this.matchFieldOptions.filter(item => item.value === this.value)
      if (matchField.length) {
        return matchField[0].label
      } else {
        return this.value
      }
    },
  },
  watch: {
  },
  created () {

  },
  methods: {

  },
}
</script>
