<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_532')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('network.text_141')" :count="params.data.length" :action="$t('network.text_532')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <redirect-form-items v-if="isOneCloud" :form="form" @redirectChange="handleRedirectChange" />
        <template v-if="!isRedirect">
          <a-form-item :label="$t('network.text_139')">
            <base-select
              resource="loadbalancerbackendgroups"
              need-params
              :params="bgParams"
              filterable
              v-decorator="decorators.backend_group"
              :select-props="{ placeholder: $t('network.text_394') }" />
          </a-form-item>
          <a-form-item v-if="isOneCloud" :label="$t('network.text_527')">
            <div slot="extra">{{$t('network.text_438')}}</div>
            <a-input :min="0" v-decorator="decorators.http_request_rate" :addonAfter="$t('network.text_439')" type="number" />
          </a-form-item>
          <a-form-item v-if="isOneCloud" :label="$t('network.text_440')">
            <div slot="extra">{{$t('network.text_528')}}</div>
            <a-input :min="0" v-decorator="decorators.http_request_rate_per_src" :addonAfter="$t('network.text_439')" type="number" />
          </a-form-item>
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
// import * as R from 'ramda'
import RedirectFormItems from '@Network/views/loadbalancerlistener/components/RedirectFormItems'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LoadbalancerlistenerruleUpdateDialog',
  components: {
    RedirectFormItems,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      isRedirect: false,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
      },
      decorators: {
        backend_group: [
          'backend_group',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_394') },
            ],
          },
        ],
        http_request_rate: [
          'http_request_rate',
          {
            normalize: v => Number(v),
            initialValue: 0,
          },
        ],
        http_request_rate_per_src: [
          'http_request_rate_per_src',
          {
            normalize: v => Number(v),
            initialValue: 0,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    isOneCloud () {
      return this.params.lbListenerData.provider === 'OneCloud'
    },
    columns () {
      const showFields = ['name', 'domain', 'path']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    bgParams () {
      const params = {
        scope: this.$store.getters.scope,
        loadbalancer: this.params.lbListenerData.loadbalancer_id,
      }
      if (this.params.provider && this.params.provider.toLowerCase() === 'aliyun') {
        params.type = 'normal'
      }
      return params
    },
  },
  created () {
    this.form.fc.getFieldDecorator('listener_type', {
      preserve: true,
      initialValue: this.params.lbListenerData.listener_type,
    })
  },
  mounted () {
    this.backfill()
  },
  methods: {
    async backfill () {
      const { data = [] } = this.params
      await this.$nextTick()
      if (data && data.length > 0) {
        const rowData = data[0]
        this.isRedirect = rowData.redirect === 'raw'
        if (this.isRedirect) {
          this.form.fc.setFieldsValue({
            redirect: this.isRedirect,
          }, () => {
            this.form.fc.setFieldsValue({
              redirect_code: rowData.redirect_code,
              redirect_scheme: rowData.redirect_scheme,
              redirect_host: rowData.redirect_host,
              redirect_path: rowData.redirect_path,
            })
          })
        } else {
          this.form.fc.setFieldsValue({
            backend_group: rowData.backend_group,
            http_request_rate: rowData.http_request_rate,
            http_request_rate_per_src: rowData.http_request_rate_per_src,
          })
        }
      }
    },
    async onValuesChange (props, values) {
      await this.$nextTick()
      const redirectKeys = ['redirect', 'redirect_scheme', 'redirect_host', 'redirect_path']
      if (redirectKeys.indexOf(Object.keys(values)[0]) > -1) {
        this.form.fc.resetFields(['check'])
        this.form.fc.validateFields(['check'])
      }
    },
    handleRedirectChange (bool) {
      this.isRedirect = bool
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.redirect = values.redirect ? 'raw' : 'off'
        await this.params.onManager('update', {
          id: this.params.data[0].id,
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
