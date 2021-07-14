<template>
  <div>
    <!-- 管理规则组 -->
    <managed-rule-group :value="statement.managed_rule_group_name" :ruleGroupId="statement.rule_group_id" />
    <!-- 取反 -->
    <!-- <negation v-if="isNegationShow" :value="!statement.negation" :label="$t('')" /> -->
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import ManagedRuleGroup from '../statementComponents/ManagedRuleGroup'
// import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'Size',
  components: {
    ManagedRuleGroup,
    // Negation,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
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
  computed: {
    // isNegationShow () {
    //   return this.wafBrand && this.wafBrand === 'Azure'
    // },
  },
}
</script>
