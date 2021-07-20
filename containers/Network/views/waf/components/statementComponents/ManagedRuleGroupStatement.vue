<template>
  <div>
    <!-- 管理规则组名称 -->
    <a-form-item :label="$t('network_waf_statement.label.managed_rule_group_name')" v-bind="formLayout">
      <a-input v-if="isEdit" :value="value" />
      <box-show v-else :value="value" />
    </a-form-item>
    <!-- 管理规则组子项 -->
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import BoxShow from './BoxShow'
// import { uuid } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ManagedRuleGroupStatement',
  components: {
    BoxShow,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    value: String,
    isEdit: Boolean,
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
    // this.initData()
  },
  methods: {
    initData () {
      if (this.ruleGroupId) {
        this.getRuleGroup()
      }
    },
    async getRuleGroup () {
      try {
        // 获取管理规则组中的子项
        // const ruleGroup = await new this.$Manager('waf_rules', 'v2').list({ params: { $t: uuid(), filter: `waf_rule_group_id.in(${[this.ruleGroupId]})` } })
        // console.log('规则组', ruleGroup)
        // const { id } = ruleGroup
        // if (!id) return
        // const rules = await new this.$Manager('')
      } catch (err) { throw err }
    },
  },
}
</script>
