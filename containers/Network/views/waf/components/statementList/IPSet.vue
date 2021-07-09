<template>
  <div>
    <!-- 运算 -->
    <contains :value="statement.contains" />
    <!-- 匹配值 -->
    <match-field-values :label="$t('network_waf_statement.label.ip')" :valueList="statement.match_field_values" />
    <!-- 取反 -->
    <negation :value="statement.negation" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import Contains from '../statementComponents/Contains'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'IPSet',
  components: {
    Contains,
    MatchFieldValues,
    Negation,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    statement: Object,
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
}
</script>
