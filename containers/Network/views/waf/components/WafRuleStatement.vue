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
    <byte-match
    v-if="type === 'ByteMatch'"
    :statement="data" />
    <!-- ip类型 -->
    <ip-set v-if="type === 'IPSet'" :statement="data" />
    <!-- 大小类型 -->
    <size v-if="type === 'Size'" :type="type" :statement="data" />
  </a-card>
</template>

<script>
import WafMixin from '../mixins/waf'
import ByteMatch from './statementList/ByteMatch'
import IpSet from './statementList/IPSet'
import Size from './statementList/Size'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WafList',
  components: {
    ByteMatch,
    IpSet,
    Size,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    data: Object,
    // 条件类型
    type: String,
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
