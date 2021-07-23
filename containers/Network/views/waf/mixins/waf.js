export default {
  data () {
    return {
      wafRuleTypeMap: {
        ByteMatch: {
          label: this.$t('network_waf_statement.type.ByteMatch'),
          value: 'ByteMatch',
        },
        GeoMatch: {
          label: this.$t('network_waf_statement.type.GeoMatch'),
          value: 'GeoMatch',
        },
        IPSet: {
          label: this.$t('network_waf_statement.type.IPSet'),
          value: 'IPSet',
        },
        LabelMatch: {
          label: this.$t('network_waf_statement.type.LabelMatch'),
          value: 'LabelMatch',
        },
        ManagedRuleGroup: {
          label: this.$t('network_waf_statement.type.ManagedRuleGroup'),
          value: 'ManagedRuleGroup',
        },
        Rate: {
          label: this.$t('network_waf_statement.type.Rate'),
          value: 'Rate',
        },
        RegexSet: {
          label: this.$t('network_waf_statement.type.RegexSet'),
          value: 'RegexSet',
        },
        RuleGroup: {
          label: this.$t('network_waf_statement.type.RuleGroup'),
          value: 'RuleGroup',
        },
        Size: {
          label: this.$t('network_waf_statement.type.Size'),
          value: 'Size',
        },
        SqliMatch: {
          label: this.$t('network_waf_statement.type.SqliMatch'),
          value: 'SqliMatch',
        },
        XssMatch: {
          label: this.$t('network_waf_statement.type.XssMatch'),
          value: 'XssMatch',
        },
      },
      wafRuleActionOptions: [
        {
          label: this.$t('network.waf.rule_action_Allow'),
          value: 'Allow',
        },
        {
          label: this.$t('network.waf.rule_action_Block'),
          value: 'Block',
        },
        {
          label: this.$t('network.waf.rule_action_Log'),
          value: 'Log',
        },
        {
          label: this.$t('network.waf.rule_action_Count'),
          value: 'Count',
        },
        {
          label: this.$t('network.waf.rule_action_Alert'),
          value: 'Alert',
        },
        {
          label: this.$t('network.waf.rule_action_Detection'),
          value: 'Detection',
        },
      ],
      statementConditionOptions: [
        {
          id: 1,
          label: this.$t('network.waf.match_null'),
          value: '',
        },
        {
          id: 1,
          label: this.$t('network.waf.match_any'),
          value: 'Or',
        },
        {
          id: 2,
          label: this.$t('network.waf.match_all'),
          value: 'And',
        },
        {
          id: 3,
          label: this.$t('network.waf.match_not'),
          value: 'Not',
        },
      ],
    }
  },
  created () {
  },
  methods: {
    hasField (data, field) {
      return data.hasOwnProperty(field)
    },
  },
}
