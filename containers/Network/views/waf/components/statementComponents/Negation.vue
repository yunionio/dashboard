<template>
  <div>
    <a-form-item :label="label || $t('network_waf_statement.label.compute')" v-bind="formLayout">
      <a-radio-group v-model="value">
        <a-radio-button v-for="item of negationOpts" :key="item.value" :value="item.value">{{item.label}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NegationStatement',
  mixins: [WindowsMixin, WafMixin],
  props: {
    label: String,
    type: String,
    value: String,
    wafBrand: String,
    selectOptions: Array,
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
    negationOpts () {
      if (this.selectOptions) return this.selectOptions
      return [
        { label: this.$t('network_waf_statement.negation.true'), value: true },
        { label: this.$t('network_waf_statement.negation.false'), value: false },
      ]
    },
  },
}
</script>
