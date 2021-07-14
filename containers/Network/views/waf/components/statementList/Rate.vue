<template>
  <div>
    <!-- 速率限制 -->
    <limit :value="statement.limit" />
    <!-- 匹配变量 -->
    <match-field :value="statement.match_field" />
    <!-- 操作器 -->
    <operator :value="statement.operator" :type="type" />
    <!-- 转换 -->
    <transformations :valueList="statement.transformations" />
    <!-- 匹配值 -->
    <match-field-values :valueList="statement.match_field_values" />
    <!-- 取反 -->
    <!-- <negation v-if="isNegationShow" :value="!statement.negation" /> -->
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchField from '../statementComponents/MatchField'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import Operator from '../statementComponents/Operator'
import Transformations from '../statementComponents/Transformations'
// import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'Rate',
  components: {
    MatchField,
    Operator,
    Transformations,
    MatchFieldValues,
    // Negation,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
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
    // isNegationShow () {
    //   return this.wafBrand && this.wafBrand === 'Azure'
    // },
  },
}
</script>
