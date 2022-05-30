<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-alert v-if="alertProps" v-bind="alertProps" class="mb-2" />
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="this.params.name" :unit="params.unit" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item v-if="showDeleteEip" :label="$t('compute.text_1265')" v-bind="formItemLayout" :extra="$t('compute.text_1266')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.auto_delete" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button v-bind="okButtonProps" @click="handleConfirm">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DeleteLbDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        auto_delete: [
          'auto_delete',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    alertProps () {
      const { alert } = this.params
      const data = {
        String: { message: alert, type: 'warning' },
        Object: alert,
      }
      const t = R.type(alert)
      return data[t] || null
    },
    okButtonProps () {
      const defaultProps = {
        type: 'primary',
        loading: this.loading,
      }
      const { okButtonProps } = this.params
      if (okButtonProps && R.type(okButtonProps) === 'Object') {
        return Object.assign(defaultProps, okButtonProps)
      }
      return defaultProps
    },
    idKey () {
      return this.params.idKey || 'id'
    },
    showDeleteEip () {
      return this.params.data.some(item => {
        return ['OneCloud', 'Huawei'].includes(item.brand) && item.eip_mode === 'elastic_ip'
      })
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item[this.idKey])
        const values = await this.form.fc.validateFields()
        const data = {}
        if (values.auto_delete) {
          data.delete_eip = true
        }
        await this.params.onManager('batchDelete', {
          id: ids,
          managerArgs: { data },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
