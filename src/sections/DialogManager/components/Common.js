/**
 * 用于渲染自定义内容的公共dialog
 * createDialog('CommonDialog', {
 *  header: [String],       // 标题
 *  ok: [Function],         // 确定方法
 *  body: [Function],       // 内容
 *  hiddenCancel: [Boolean],// 是否隐藏取消按钮
 * })
 */
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CommonDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    renderBody () {
      if (!this.params.body) return null
      return this.params.body()
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.params.ok) {
          await this.params.ok()
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
  render (h) {
    return (
      <base-dialog onCancel={this.cancelDialog} width={this.params.width} modalProps={this.params.modalProps}>
        <div slot='header'>{ this.params.header }</div>
        <div slot='body'>
          { this.renderBody() }
        </div>
        <div slot='footer'>
          <a-button type="primary" onClick={ this.handleConfirm } loading={ this.loading }>{ this.$t('dialog.ok') }</a-button>
          { !this.params.hiddenCancel ? <a-button onClick={ this.cancelDialog }>{ this.$t('dialog.cancel') }</a-button> : null }
        </div>
      </base-dialog>
    )
  },
}
