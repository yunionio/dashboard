<template>
  <div>
    <a-form-item :label="$t('network_waf_statement.label.operator')" v-bind="formLayout">
      <a-select v-model="value">
        <a-select-option v-for="item in operatorOptions" :value="item.value" :key="item.value">
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
  name: 'OperatorStatement',
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
    operatorOptions () {
      // 根据不同type返回
      if (this.type === 'Size') {
        return [
          { label: this.$t('network_waf_statement.size.EQ'), value: 'EQ' },
          { label: this.$t('network_waf_statement.size.NE'), value: 'NE' },
          { label: this.$t('network_waf_statement.size.LE'), value: 'LE' },
          { label: this.$t('network_waf_statement.size.LT'), value: 'LT' },
          { label: this.$t('network_waf_statement.size.GE'), value: 'GE' },
          { label: this.$t('network_waf_statement.size.GT'), value: 'GT' },
        ]
      }
      return [
        { label: this.$t('network_waf_statement.operator.Exactly'), value: 'Exactly' },
        { label: this.$t('network_waf_statement.operator.StartsWith'), value: 'StartsWith' },
        { label: this.$t('network_waf_statement.operator.EndsWith'), value: 'EndsWith' },
        { label: this.$t('network_waf_statement.operator.Contains'), value: 'Contains' },
        { label: this.$t('network_waf_statement.operator.ContainsWord'), value: 'ContainsWord' },
        { label: this.$t('network_waf_statement.operator.Regex'), value: 'Regex' },
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
