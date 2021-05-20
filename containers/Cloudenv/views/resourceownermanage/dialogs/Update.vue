<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_406')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_14')" :count="params.data.length" :action="$t('cloudenv.text_406')" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <common-form-items />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
       <test-button
            :disabled="!form.fc.getFieldValue('http_proxy') && !form.fc.getFieldValue('https_proxy')"
            :post="testPost"
            :isSuccessAlert="false" />
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { formItemLayout } from '../constants'
import CommonFormItems from '../components/CommonFormItems'
import TestButton from '@/sections/TestButton'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProxysettingUpdateDialog',
  components: { CommonFormItems, TestButton },
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
      const manager = new this.$Manager('proxysettings')
      try {
        const keys = ['http_proxy', 'https_proxy']
        const values = await this.form.fc.validateFields(['http_proxy', 'https_proxy'])
        const { data } = await manager.performClassAction({
          action: 'test',
          data: {
            http_proxy: values.http_proxy,
            https_proxy: values.https_proxy,
          },
        })
        keys.forEach(k => {
          if (!data[k] || !values[k] || R.type(data[k]) !== 'Object') return false
          const { ok, reason } = data[k]
          if (ok) {
            this.$notification.success({
              message: this.$t('cloudenv.text_407', [this.$t('proxysettings')[k]]),
              description: this.$t('cloudenv.text_408'),
            })
          } else {
            this.$notification.error({
              message: this.$t('cloudenv.text_409', this.$t('proxysettings')[k]),
              description: reason,
            })
          }
        })
      } catch (err) {
        throw err
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('update', {
          id: ids[0],
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
