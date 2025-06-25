<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{$t('network.waf.rule_expression_edit')}}</div>
    <div slot="body">
      <a-textarea :rows="10" v-model="expression" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('network.text_33') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { decodeRuleExpression } from '../utils'

export default {
  name: 'WafRuleEditDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  props: {
    parmas: Object,
  },
  data () {
    return {
      loading: false,
      expression: this.params.expression,
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    handleConfirm () {
      const rules = decodeRuleExpression(this.expression)
      if (rules.length) {
        this.params.success(rules)
        this.cancelDialog()
      } else {
        this.$message.error(this.$t('network.waf.rule_expression_error'))
      }
    },
  },
}
</script>
