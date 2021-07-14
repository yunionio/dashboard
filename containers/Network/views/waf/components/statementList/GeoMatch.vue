<template>
  <div>
    <!-- 地址 -->
    <match-field-values :valueList="statement.match_field_values" :type="type" addType="select" :selectOptions="geoSelectOpts" />
    <!-- 运算 是否等于 -->
    <negation v-if="isNegationShow" :value="!statement.negation" :type="type" :wafBrand="wafBrand" :selectOptions="negationSelectOptions" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import Negation from '../statementComponents/Negation'
import { LocationList } from '@/constants/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GeoMatch',
  components: {
    MatchFieldValues,
    Negation,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
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
        { label: this.$t('network_waf_statement.negation.eq'), value: true },
        { label: this.$t('network_waf_statement.negation.noteq'), value: false },
      ]
    },
  },
}
</script>
