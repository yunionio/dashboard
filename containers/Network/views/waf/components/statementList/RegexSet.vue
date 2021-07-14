<template>
  <div>
    <!-- 匹配值 -->
    <match-field-values :label="$t('network_waf_statement.label.regex')" :valueList="match_field_values" />
    <!-- 运算 是否包含 -->
    <!-- <negation v-if="isNegationShow" :value="!statement.negation" :selectOptions="negationSelectOptions" /> -->
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
// import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RegexSet',
  components: {
    MatchFieldValues,
    // Negation,
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
      match_field_values: [],
    }
  },
  computed: {
    isNegationShow () {
      return this.wafBrand && this.wafBrand === 'Azure'
    },
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
        // TODO-glb 请求匹配值
        // this.match_field_values = [match_field_key]
        this.getRegexList(regex_set_id)
      } else {
        this.match_field_values = ['']
      }
    },
    async getRegexList (id) {
      const regexData = await new this.$manager('waf_regex_sets', 'v2').get({ id })
      console.log('regex 数据', regexData)
      const { regex_patterns: match_field_values = [''] } = regexData.waf_regex_set
      this.match_field_values = match_field_values
    },
  },
}
</script>
