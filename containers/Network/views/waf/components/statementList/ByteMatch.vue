<template>
  <div>
    <!-- 匹配变量 -->
    <match-field :value="statement.match_field" />
    <!-- 操作器 -->
    <operator :value="statement.operator" />
    <!-- 转换 -->
    <transformations :valueList="statement.transformations" />
    <!-- 匹配值 -->
    <match-field-values :valueList="statement.match_field_values" />
    <!-- 运算 只有Azure平台有-->
    <negation v-if="isNegationShow" :value="!statement.negation" :wafBrand="wafBrand" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchField from '../statementComponents/MatchField'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import Operator from '../statementComponents/Operator'
import Transformations from '../statementComponents/Transformations'
import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ByteMatch',
  components: {
    MatchField,
    Operator,
    Transformations,
    MatchFieldValues,
    Negation,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
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
    isNegationShow () {
      return this.wafBrand && this.wafBrand === 'Azure'
    },
  },
}
</script>
