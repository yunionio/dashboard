<template>
  <div>
    <a-form-item :label="$t('network_waf_statement.label.contains')" v-bind="formLayout">
      <a-radio-group v-model="value">
        <a-radio-button :value="true">{{$t('network_waf_statement.contains.in')}}</a-radio-button>
        <a-radio-button :value="false">{{$t('network_waf_statement.contains.notin')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ContainsStatement',
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    value: {
      type: Boolean,
      default: () => true,
    },
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
}
</script>
