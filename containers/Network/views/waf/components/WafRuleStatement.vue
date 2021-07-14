<template>
  <a-card class="mb-3" style="flex: 1 1 auto">
    <!-- 类型 -->
    <a-form-item :label="$t('network.text_249')" v-bind="formLayout">
      <a-select v-model="data.type">
        <a-select-option v-for="item in wafRuleTypeOptions" :value="item.value" :key="item.value">
          {{item.label}}
        </a-select-option>
      </a-select>
    </a-form-item>
    <!-- 字符串类型 -->
    <byte-match v-if="type === 'ByteMatch'" :statement="data" :wafBrand="wafBrand" />
    <!-- ip类型 -->
    <ip-set v-if="type === 'IPSet'" :statement="data" :wafBrand="wafBrand" />
    <!-- 大小类型 -->
    <size v-if="type === 'Size'" :type="type" :statement="data" :wafBrand="wafBrand" />
    <!-- 管理规则组 -->
    <managed-rule-group v-if="type === 'ManagedRuleGroup'" :type="type" :statement="data" :wafBrand="wafBrand" />
    <!-- 地址 -->
    <geo-match v-if="type === 'GeoMatch'" :type="type" :statement="data" :wafBrand="wafBrand" />
    <!-- 正则 -->
    <regex-set :type="type" :statement="data" :wafBrand="wafBrand" />
  </a-card>
</template>

<script>
import WafMixin from '../mixins/waf'
import ByteMatch from './statementList/ByteMatch'
import IpSet from './statementList/IPSet'
import Size from './statementList/Size'
import ManagedRuleGroup from './statementList/ManagedRuleGroup'
import GeoMatch from './statementList/GeoMatch'
import RegexSet from './statementList/RegexSet'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WafList',
  components: {
    ByteMatch,
    IpSet,
    Size,
    ManagedRuleGroup,
    GeoMatch,
    RegexSet,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    data: Object,
    // 条件类型
    type: String,
    wafBrand: String,
  },
  data () {
    const initData = this.data || {}
    const { type = ' ' } = initData
    const index = this.index
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
      decorators: {
        // 类型
        type: [
          `statements[${index}].type`,
          {
            initialValue: type,
            rules: [{ required: true }],
          },
        ],
        // 运算
        compute: [
          'compute',
          {
            rules: [{ required: true }],
          },
        ],
        // ip
        ip: [
          'ip',
          {
            rules: [{ required: true }],
          },
        ],
      },
    }
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
