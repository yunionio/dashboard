<template>
  <div>
    <!-- 匹配字段 -->
    <match-field-key v-if="hasField(statement, 'match_field_key')" :value="statement.match_field_key" :matchField="statement.match_field" :isEdit="isEdit" />
    <!-- 匹配值 -->
    <match-field-values :valueList="match_field_values" :isEdit="isEdit" />
    <!-- 运算 -->
    <negation :value="!statement.negation" :wafBrand="wafBrand" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchFieldKey from '../statementComponents/MatchFieldKey'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LabelMatch',
  components: {
    MatchFieldValues,
    Negation,
    MatchFieldKey,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    isEdit: Boolean,
    statement: Object,
    wafBrand: String,
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
    match_field_values () {
      const { match_field_values, search_string } = this.statement
      if (match_field_values) { // azure
        return match_field_values
      }
      if (search_string) {
        return [search_string]
      }
      return ['']
    },
  },
}
</script>
