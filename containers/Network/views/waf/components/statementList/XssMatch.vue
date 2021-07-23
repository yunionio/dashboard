<template>
  <div>
    <!-- 匹配变量 -->
    <match-field :value="statement.match_field" :isEdit="isEdit" />
    <!-- 匹配字段 -->
    <match-field-key v-if="hasField(statement, 'match_field_key')" :value="statement.match_field_key" :isEdit="isEdit" />
    <!-- 操作器 -->
    <!-- <operator :value="statement.operator" /> -->
    <!-- 转换 -->
    <transformations :valueList="statement.transformations" :isEdit="isEdit" />
    <!-- 匹配值 -->
    <!-- <match-field-values :valueList="match_field_values" /> -->
    <!-- 运算 -->
    <negation :value="!statement.negation" :wafBrand="wafBrand" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchField from '../statementComponents/MatchField'
import MatchFieldKey from '../statementComponents/MatchFieldKey'
import Transformations from '../statementComponents/Transformations'
import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'XssMatch',
  components: {
    MatchField,
    Transformations,
    MatchFieldKey,
    Negation,
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
      if (match_field_values) {
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
