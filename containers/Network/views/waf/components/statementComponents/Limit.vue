<template>
  <div>
    <!-- 限制 -->
    <a-form-item :label="$t('network_waf_statement.label.limit')" v-bind="formLayout">
      <a-input v-if="isEdit" :value="value" />
      <box-show v-else :value="value" />
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import BoxShow from './BoxShow'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LimitStatement',
  components: {
    BoxShow,
  },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    value: String,
    isEdit: Boolean,
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
