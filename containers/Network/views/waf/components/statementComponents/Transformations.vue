<template>
  <div>
    <a-form-item :label="$t('network_waf_statement.label.transformations')" v-bind="formLayout">
      <template v-for="(transformation, index) in transformations">
        <a-select v-model="transformations[index]" :key="index">
          <a-select-option v-for="item in transformationOptions" :value="item.value" :key="item.value">
            {{item.label}}
          </a-select-option>
        </a-select>
      </template>
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TransformationsStatement',
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    valueList: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      transformations: this.valueList,
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
    transformationOptions () {
      // 根据不同type返回 Azure不同 TODO
      return [
        { label: this.$t('network_waf_statement.transformation.CompressWithSpace'), value: 'CompressWithSpace' },
        { label: this.$t('network_waf_statement.transformation.HtmlEntityDecode'), value: 'HtmlEntityDecode' },
        { label: this.$t('network_waf_statement.transformation.Lowercase'), value: 'Lowercase' },
        { label: this.$t('network_waf_statement.transformation.CmdLine'), value: 'CmdLine' },
        { label: this.$t('network_waf_statement.transformation.UrlDecode'), value: 'UrlDecode' },
        { label: this.$t('network_waf_statement.transformation.UrlEncode'), value: 'UrlEncode' },
        { label: this.$t('network_waf_statement.transformation.Trim'), value: 'Trim' },
        { label: this.$t('network_waf_statement.transformation.RemoveNulls'), value: 'RemoveNulls' },
      ]
    },
  },
  watch: {
  },
  created () {

  },
  methods: {

  },
}
</script>
