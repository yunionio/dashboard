<template>
  <div>
    <a-form-item v-if="transformations && transformations.length" :label="$t('network_waf_statement.label.transformations')" v-bind="formLayout">
      <template v-for="(transformation, index) in transformations">
        <a-select v-if="isEdit" v-model="transformations[index]" :key="index">
          <a-select-option v-for="item in transformationOptions" :value="item.value" :key="item.value">
            {{item.label}}
          </a-select-option>
        </a-select>
        <box-show v-else :value="getShowValue(index)" :key="index" />
      </template>
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import BoxShow from './BoxShow'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TransformationsStatement',
  components: {
    BoxShow,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    isEdit: Boolean,
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
    getShowValue (index) {
      const transformations = this.transformationOptions.filter(item => item.value === this.valueList[index])
      if (transformations && transformations.length) {
        return transformations[0].label
      } else {
        return this.valueList[index] || this.$t('network.waf.match_null')
      }
    },
  },
}
</script>
