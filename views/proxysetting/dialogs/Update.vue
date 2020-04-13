<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">修改属性</div>
    <div slot="body">
      <dialog-selected-tips name="代理" :count="params.data.length" action="修改属性" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <common-form-items />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { formItemLayout } from '../constants'
import CommonFormItems from '../components/CommonFormItems'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProxysettingUpdateDialog',
  components: { CommonFormItems },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      formItemLayout,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  created () {
    this._backfill()
  },
  methods: {
    async _backfill () {
      await this.$nextTick()
      const { setFieldsValue } = this.form.fc
      const [row] = this.params.data
      setFieldsValue({
        https_proxy: row.https_proxy,
        http_proxy: row.http_proxy,
        no_proxy: row.no_proxy,
      })
    },
    async testPost () {
      const values = await this.form.fc.validateFields()
      await this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'test-connectivity',
          data: values,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchUpdate', {
          ids,
          managerArgs: {
            data: values,
          },
        })
        this.cancelDialog()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
