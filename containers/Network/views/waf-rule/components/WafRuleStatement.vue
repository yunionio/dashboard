<template>
  <a-card class="mb-3" style="flex: 1 1 auto">
    <!-- 类型 -->
    <a-form-item :label="$t('network.text_249')" v-bind="formLayout">
      <a-select v-if="isEdit" v-model="data.type">
        <a-select-option v-for="item in wafRuleTypeOptions" :value="item.value" :key="item.value">
          {{item.label}}
        </a-select-option>
      </a-select>
      <box-show v-else :value="ruleTypeValue" />
    </a-form-item>
    <!-- 条件 -->
    <component :is="type" :type="type" :statement="data" :wafBrand="wafBrand" :isEdit="isEdit" />
  </a-card>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import WafMixin from '../mixins/waf'
import BoxShow from './statementComponents/BoxShow'
import ByteMatch from './statementList/ByteMatch'
import IPSet from './statementList/IPSet'
import Size from './statementList/Size'
import ManagedRuleGroup from './statementList/ManagedRuleGroup'
import GeoMatch from './statementList/GeoMatch'
import RegexSet from './statementList/RegexSet'
import Rate from './statementList/Rate'
import RuleGroup from './statementList/RuleGroup'
import SqliMatch from './statementList/SqliMatch'
import XssMatch from './statementList/XssMatch'
import LabelMatch from './statementList/LabelMatch'

export default {
  name: 'WafList',
  components: {
    BoxShow,
    ByteMatch,
    IPSet,
    Size,
    ManagedRuleGroup,
    GeoMatch,
    RegexSet,
    Rate,
    RuleGroup,
    SqliMatch,
    XssMatch,
    LabelMatch,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    data: Object,
    // 条件类型
    type: String,
    isEdit: Boolean,
    // waf的平台
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
      wafRuleTypeOptions: [],
    }
  },
  computed: {
    ruleTypeValue () {
      const ruleType = this.wafRuleTypeOptions.filter(item => item.value === this.data.type)
      if (ruleType && ruleType.length) {
        return ruleType[0].label
      } else {
        return this.data.type || ''
      }
    },
  },
  watch: {
    wafRuleTypeMap: {
      handler: function (val) {
        if (val) {
          const wafRuleTypesKeys = Object.keys(val || {})
          this.wafRuleTypeOptions = wafRuleTypesKeys.map(key => {
            return val[key]
          })
        }
      },
      immediate: true,
    },
  },
  created () {

  },
  methods: {

  },
}
</script>
