<template>
  <div>
    <!-- 匹配字段 -->
    <a-form-item :label="matchFieldKeyLabel || $t('network_waf_statement.label.match_field_key')" v-bind="formLayout">
      <a-input v-if="isEdit" :value="value" />
      <box-show v-else :value="value" />
    </a-form-item>
  </div>
</template>

<script>
import WafMixin from '../../mixins/waf'
import BoxShow from './BoxShow.vue'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MatchFieldKeyStatement',
  components: { BoxShow },
  mixins: [WindowsMixin, WafMixin],
  props: {
    type: String,
    label: String,
    value: String,
    isEdit: Boolean,
    matchField: String,
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
      matchFieldList: [
        { label: this.$t('network_waf_statement.match_field_key.Header'), value: 'Header' },
        { label: this.$t('network_waf_statement.match_field_key.PostArgs'), value: 'PostArgs' },
        { label: this.$t('network_waf_statement.match_field_key.Cookie'), value: 'Cookie' },
        // { label: this.$t('network_waf_statement.match_field_key.RemoteAddr'), value: 'RemoteAddr' },
      ],
    }
  },
  computed: {
    matchFieldKeyLabel () {
      if (this.label) return this.label
      const matchFieldKey = this.matchFieldList.filter(item => item.value === this.matchField)
      if (matchFieldKey && matchFieldKey.length) {
        return matchFieldKey[0].label
      }
      return ''
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
