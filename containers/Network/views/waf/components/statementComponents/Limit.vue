<template>
  <div>
    <!-- 限制 -->
    <a-form-item :label="$t('network_waf_statement.label.limit')" v-bind="formLayout">
      <a-input :value="value" />
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LimitStatement',
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    value: String,
    ruleGroupId: String,
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
  },
  watch: {
  },
  created () {
  },
  methods: {
  },
}
</script>
