<template>
  <div>
    <!-- 管理规则组名称 -->
    <a-form-item :label="$t('network_waf_statement.label.managed_rule_group_name')" v-bind="formLayout">
      <a-input :value="value" />
    </a-form-item>
    <!-- 管理规则组子项 -->
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ManagedRuleGroupStatement',
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    value: String,
    ruleGroupId: String,
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
  },
  watch: {
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      if (this.ruleGroupId) {
        this.getRuleGroup()
      }
    },
    async getRuleGroup () {
      try {
        // TODO-glb 获取管理规则组中的子项
        // const ruleGroup = await new this.$Manager('waf_rule_groups', 'v2').get({ id: this.ruleGroupId })
        // console.log('规则组', ruleGroup)
      } catch (err) { throw err }
    },
  },
}
</script>
