<template>
  <div>
    <!-- 速率限制 -->
    <limit :value="statement.limit" :isEdit="isEdit" />
    <forward-ip-header v-if="isForwardIpHeaderShow" :value="statement.forwarded_ip_header" :isEdit="isEdit" />
    <!-- 匹配值 -->
    <match-field-values :valueList="statement.match_field_values" :isEdit="isEdit" />
    <!-- 运算 -->
    <negation :value="!statement.negation" :isEdit="isEdit" />
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import ForwardIpHeader from '../statementComponents/ForwardIpHeader'
import MatchFieldValues from '../statementComponents/MatchFieldValues'
import Negation from '../statementComponents/Negation'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'Rate',
  components: {
    MatchFieldValues,
    Negation,
    ForwardIpHeader,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
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
    }
  },
  computed: {
    isForwardIpHeaderShow () {
      return this.statement.hasOwnProperty('forwarded_ip_header')
    },
  },
}
</script>
