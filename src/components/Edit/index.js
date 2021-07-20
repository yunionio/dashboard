import './index.scss'
import i18n from '@/locales'
import Form from './Form.vue'

export default {
  name: 'Edit',
  components: {
    EditForm: Form,
  },
  props: {
    label: {
      type: String,
      default: i18n.t('common.name'),
    },
    formRules: {
      type: Array,
    },
    showSuccessMessage: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      visible: false,
    }
  },
  computed: {
    title () {
      return `${i18n.t('common.edit')}${this.label}`
    },
  },
  methods: {
    submit (values) {
      this.hideForm()
      if (!this.$slots.default) { // 没有自定义表单slot
        this.$emit('update', values)
        if (this.showSuccessMessage) {
          this.$message.success(this.$t('common.success'))
        }
      }
    },
    hideForm () {
      this.visible = false
    },
  },
  watch: {
    visible (v) {
      this.$emit('update:visible', v)
    },
  },
  render (h) {
    const { default: customForm } = this.$slots
    return (
      <div class='edit-icon mini-text'>
        <a-popover v-model={ this.visible } title={ this.title } trigger="click" destroyTooltipOnHide={true}>
          <a-icon type='edit' class='primary-color' />
          { customForm ? <customForm slot="content" onSubmit={this.submit} /> : <edit-form slot="content" { ...{ attrs: this.$attrs, props: this.$props } } onSubmit={this.submit} onCancel={ this.hideForm } /> }
        </a-popover>
      </div>
    )
  },
}
