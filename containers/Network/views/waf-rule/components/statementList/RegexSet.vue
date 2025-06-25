<template>
  <div>
    <!-- 匹配变量 -->
    <match-field v-if="hasField(statement, 'match_field')" :value="statement.match_field" :isEdit="isEdit" />
    <!-- 匹配值 -->
    <match-field-values :label="$t('network_waf_statement.label.regex')" :valueList="match_field_values" :isEdit="isEdit" />
    <!-- 运算 是否包含 -->
    <negation :value="!statement.negation" :selectOptions="negationSelectOptions" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchField from '../statementComponents/MatchField'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
// import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RegexSet',
  components: {
    MatchField,
    MatchFieldValues,
    // Negation,
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
      match_field_values: [],
    }
  },
  computed: {
    negationSelectOptions () {
      return [
        { label: this.$t('network_waf_statement.negation.in'), value: true },
        { label: this.$t('network_waf_statement.negation.notin'), value: false },
      ]
    },
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      const { match_field_values, regex_set_id } = this.statement
      if (match_field_values) {
        // 匹配值
        this.match_field_values = match_field_values
      } else if (regex_set_id) {
        // this.match_field_values = [match_field_key]
        this.getRegexList(regex_set_id)
      } else {
        this.match_field_values = ['']
      }
    },
    async getRegexList (id) {
      const regexData = await new this.$Manager('waf_regexsets', 'v2').get({ id })
      const { regex_patterns: match_field_values = [''] } = regexData.data
      this.match_field_values = match_field_values
    },
  },
}
</script>
