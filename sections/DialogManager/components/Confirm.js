import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

const TITLE_STYLE = {
  display: 'block',
  overflow: 'hidden',
  fontSize: '16px',
  lineHeight: 1.4,
}

const CONTENT_STYLE = {
  marginTop: '8px',
  fontSize: '14px',
}

const confirm = {
  name: 'ConfirmDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      laoding: false,
      defaultParams: {
        width: 420,
        type: 'confirm',
        header: '提示',
        okText: this.$t('dialog.ok'),
        cancelText: this.$t('dialog.cancel'),
      },
      types: {
        confirm: {
          icon: <a-icon class="warning-color" type="question-circle" />,
        },
      },
    }
  },
  methods: {
    async handleConfirm () {
      const { onOk } = this.params
      try {
        this.laoding = true
        if (onOk) {
          await onOk()
        }
      } catch (err) {
        throw err
      } finally {
        this.laoding = false
        this.cancelDialog()
      }
    },
  },
  render () {
    const { title, type, okText, cancelText, content, header } = Object.assign(this.defaultParams, this.params)
    const { icon } = this.types[type] || {}
    const RenderTitle = () => {
      if (title) {
        return <span class="heading-color" style={TITLE_STYLE}>{title}</span>
      }
      return null
    }
    const RenderContent = () => {
      if (content) {
        return <div class="text-color" style={CONTENT_STYLE}>{content}</div>
      }
      return null
    }
    return (
      <base-dialog width={420} onCancel={this.cancelDialog}>
        <div slot="header">{header}</div>
        <div slot="body">
          <div class="d-flex">
            <span style="font-size: 22px;margin-top:-5px">{icon}</span>
            <div class="pl-2 w-100 bd-highlight">
              <RenderTitle />
              <RenderContent />
            </div>
          </div>
        </div>
        <div slot="footer">
          <a-button type="primary" onClick={this.handleConfirm}>{okText}</a-button>
          <a-button onClick={this.cancelDialog}>{cancelText}</a-button>
        </div>
      </base-dialog>
    )
  },
}

export default confirm
