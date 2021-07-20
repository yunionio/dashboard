<template>
  <div>
    <!-- 规则组 -->
    <rule-group-statement :value="statement && statement.rule_group_id" :ruleGroupId="statement && statement.rule_group_id" :isEdit="isEdit" />
    <!-- 取反 -->
    <negation :value="!statement.negation" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import RuleGroupStatement from '../statementComponents/RuleGroupStatement'
import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RuleGroup',
  components: {
    RuleGroupStatement,
    Negation,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    isEdit: Boolean,
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
