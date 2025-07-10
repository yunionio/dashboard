<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
export default {
  name: 'SmartFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: this.$form.createForm(this, { name: 'SmartFormDialog' }),
    }
  },
  methods: {
    async handleConfirm () {
      const { callback } = this.params
      const { validateFields } = this.form
      try {
        const values = await validateFields()
        this.loading = true
        if (callback && R.type(callback).includes('Function')) {
          await callback(values)
          this.cancelDialog()
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
  render (h) {
    const { title, decorators, width = 400 } = this.params
    const { getFieldDecorator } = this.form
    const RenderHeader = () => {
      if (title) {
        return <div slot="header">{title}</div>
      }
      return null
    }
    const formItem = (decorator) => {
      const [name, options, inputParams] = decorator
      const { label, placeholder = '', render, extra } = inputParams
      const RenderFormVal = () => {
        if (render && R.type(render) === 'Function') {
          return render(this.form)
        }
        return name === 'password' ? <a-input-password placeholder={placeholder} /> : <a-input placeholder={placeholder} />
      }
      return (
        <a-form-item label={label}>
          {
            getFieldDecorator(name, options)(
              <RenderFormVal/>,
            )
          }
          {
            extra ? <div slot="extra">{extra()}</div> : null
          }
        </a-form-item>
      )
    }
    const RenderForm = () => {
      const decoratorArrs = Object.keys(decorators)
      const defaultFormItemLayout = {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      }
      const { formItemLayout } = this.params
      const { wrapperCol, labelCol } = formItemLayout || defaultFormItemLayout
      if (decorators && decoratorArrs.length > 0) {
        return (
          <div slot="body">
            <a-form class="mt-3" form={this.form} wrapperCol={wrapperCol} labelCol={labelCol}>
              {decoratorArrs.map(k => {
                return formItem(decorators[k])
              })}
            </a-form>
          </div>
        )
      }
      return null
    }
    const RenderFormFooter = () => {
      return (
        <div slot="footer">
          <a-button type="primary" onClick={this.handleConfirm} loading={this.loading}>{ this.$t('dialog.ok') }</a-button>
          <a-button onClick={this.cancelDialog}>{ this.$t('dialog.cancel') }</a-button>
        </div>
      )
    }
    return (
      <base-dialog onCancel={this.cancelDialog} width={width}>
        <RenderHeader/>
        <RenderForm/>
        <RenderFormFooter />
      </base-dialog>
    )
  },
}
</script>
