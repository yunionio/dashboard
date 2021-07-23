<template>
  <div>
    <!-- 大小 -->
    <size v-if="hasField(statement, 'size')" :value="statement.size" :isEdit="isEdit" />
    <!-- 匹配变量 -->
    <match-field :value="statement.match_field" :isEdit="isEdit" />
    <!-- 匹配字段 -->
    <match-field-key v-if="hasField(statement, 'match_field_key')" :value="statement.match_field_key" :matchField="statement.match_field" :isEdit="isEdit" />
    <!-- 操作器 -->
    <operator :value="statement.operator" :type="type" :isEdit="isEdit" />
    <!-- 转换 -->
    <transformations :valueList="statement.transformations" :isEdit="isEdit" />
    <!-- 匹配值 -->
    <match-field-values :valueList="statement.match_field_values" :isEdit="isEdit" />
    <!-- 取反 -->
    <negation v-if="isNegationShow" :value="!statement.negation" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchField from '../statementComponents/MatchField'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import Operator from '../statementComponents/Operator'
import Transformations from '../statementComponents/Transformations'
import Negation from '../statementComponents/Negation'
import MatchFieldKey from '../statementComponents/MatchFieldKey'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'Size',
  components: {
    MatchField,
    Operator,
    Transformations,
    MatchFieldValues,
    Negation,
    MatchFieldKey,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
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
    isNegationShow () {
      return this.wafBrand && this.wafBrand === 'Azure'
    },
  },
}
</script>
