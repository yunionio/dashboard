<template>
  <div>
    <a-form-item :label="$t('network_waf_statement.label.operator')" v-bind="formLayout">
      <a-select v-if="isEdit" v-model="value">
        <a-select-option v-for="item in operatorOptions" :value="item.value" :key="item.value">
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
  name: 'OperatorStatement',
  components: {
    BoxShow,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    value: String,
    isEdit: Boolean,
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
    showValue () {
      const operator = this.operatorOptions.filter(item => item.value.toLowerCase() === (this.value || '').toLowerCase())
      if (operator && operator.length) {
        return operator[0].label
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
