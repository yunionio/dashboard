<template>
  <div>
    <a-form-item :label="label || $t('network_waf_statement.label.compute')" v-bind="formLayout">
      <a-radio-group v-if="isEdit" v-model="value">
        <a-radio-button v-for="item of negationOpts" :key="item.value" :value="item.value">{{item.label}}</a-radio-button>
      </a-radio-group>
      <box-show v-else :value="showValue" />
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import BoxShow from './BoxShow'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NegationStatement',
  components: {
    BoxShow,
  },
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
        { label: this.$t('network_waf_statement.negation.in'), value: true },
        { label: this.$t('network_waf_statement.negation.notin'), value: false },
      ]
    },
    showValue () {
      const negation = this.negationOpts.filter(item => item.value === this.value)
      if (negation && negation.length) {
        return negation[0].label
      } else {
        return this.value
      }
    },
  },
}
</script>
