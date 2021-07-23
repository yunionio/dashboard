<template>
  <div>
    <!-- 匹配字段 -->
    <match-field-key v-if="hasField(statement, 'match_field_key')" :value="statement.match_field_key" :matchField="statement.match_field" :isEdit="isEdit" />
    <!-- 地址 -->
    <match-field-values :valueList="statement.match_field_values" :type="type" addType="select" :selectOptions="geoSelectOpts" :isEdit="isEdit" />
    <!-- 运算 是否等于 -->
    <negation v-if="isNegationShow" :value="!statement.negation" :type="type" :wafBrand="wafBrand" :selectOptions="negationSelectOptions" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import MatchFieldKey from '../statementComponents/MatchFieldKey'
import Negation from '../statementComponents/Negation'
import { LocationList } from '@/constants/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GeoMatch',
  components: {
    MatchFieldValues,
    Negation,
    MatchFieldKey,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    isEdit: Boolean,
    wafBrand: String,
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
      geoSelectOpts: LocationList,
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
}
</script>
