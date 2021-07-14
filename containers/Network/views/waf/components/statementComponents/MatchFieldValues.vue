<template>
  <div>
    <a-form-item :label="label || $t('network_waf_statement.label.match_field_values')" v-bind="formLayout">
      <template v-for="(matchFieldValue, index) in matchFieldValues">
        <a-select v-if="addType === 'select'" v-model="matchFieldValues[index]" :key="index">
          <a-select-option v-for="item in options" :value="item.value" :key="item.value">
            {{item.label}}
          </a-select-option>
        </a-select>
        <a-input v-else-if="addType === 'input'" :value="matchFieldValues[index]" :key="index" />
      </template>
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MatchFieldValuesStatement',
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    label: {
      type: String,
    },
    addType: {
      type: String,
      default: () => 'input', // input select
    },
    selectOptions: {
      type: Array,
      default: () => [],
    },
    valueList: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      matchFieldValues: this.valueList || [''],
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
    options () {
      // 根据不同type返回
      return this.selectOptions
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
