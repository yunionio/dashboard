<template>
  <div>
    <!-- 匹配变量 -->
    <match-field v-if="hasField(statement, 'match_field')" :value="statement.match_field" :isEdit="isEdit" />
    <forward-ip-header v-if="hasField(statement, 'forwarded_ip_header')" :value="statement.forwarded_ip_header" :isEdit="isEdit" />
    <!-- 匹配字段 -->
    <match-field-key v-if="hasField(statement, 'match_field_key')" :value="statement.match_field_key" :matchField="statement.match_field" :isEdit="isEdit" />
    <!-- 匹配值 -->
    <match-field-values :label="$t('network_waf_statement.label.ip')" :valueList="match_field_values" :isEdit="isEdit" />
    <!-- 运算 是否包含 -->
    <negation v-if="isNegationShow" :value="!statement.negation" :selectOptions="negationSelectOptions" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchField from '../statementComponents/MatchField'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import MatchFieldKey from '../statementComponents/MatchFieldKey'
import Negation from '../statementComponents/Negation'
import ForwardIpHeader from '../statementComponents/ForwardIpHeader'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'IPSet',
  components: {
    MatchField,
    MatchFieldValues,
    Negation,
    MatchFieldKey,
    ForwardIpHeader,
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
      const { match_field_values, ip_set_id } = this.statement
      if (match_field_values) {
        // 匹配值
        this.match_field_values = match_field_values
      } else if (ip_set_id) {
        // this.match_field_values = [match_field_key]
        this.getIpList(ip_set_id)
      } else {
        this.match_field_values = ['']
      }
    },
    async getIpList (id) {
      const ipData = await new this.$Manager('waf_ipsets', 'v2').get({ id })
      const { addresses: match_field_values = [''] } = ipData.data
      this.match_field_values = match_field_values
    },
  },
}
</script>
