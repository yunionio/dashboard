<template>
  <div>
    <a-form-item :label="$t('network_waf_statement.label.match_field')" v-bind="formLayout">
      <a-select v-model="value">
        <a-select-option v-for="item in matchFieldOptions" :value="item.value" :key="item.value">
          {{item.label}}
        </a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MatchFieldStatement',
  mixins: [WindowsMixin, WafMixin],
  props: {
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
        { label: 'Body', value: 'Body' },
        { label: 'JsonBody', value: 'JsonBody' },
        { label: 'Query', value: 'Query' },
        { label: 'Method', value: 'Method' },
        { label: 'Header', value: 'Header' },
        { label: 'UriPath', value: 'UriPath' },
        { label: 'PostArgs', value: 'PostArgs' },
        { label: 'Cookie', value: 'Cookie' },
      ]
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
