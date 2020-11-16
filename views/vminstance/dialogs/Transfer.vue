<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1127')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1127')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_111')" :extra="$t('compute.text_1164')">
          <base-select
            v-decorator="decorators.host"
            resource="hosts"
            remote
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :params="hostsParams"
            :mapper="hostsMapper"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_314') }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1261')" v-if="isSingle" :extra="$t('compute.text_1262')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.rescue_mode" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" v-if="isSingle && firstData.status === 'ready'" :extra="$t('compute.text_1263')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.auto_start" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmTransferDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        host: [
          'host',
          {
            rules: [
              { required: false, message: this.$t('compute.text_314'), trigger: 'change' },
            ],
          },
        ],
        rescue_mode: [
          'rescue_mode',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
        auto_start: [
          'auto_start',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode']),
    firstData () {
      return this.params.data[0]
    },
    isSingle () {
      return this.params.data.length === 1
    },
    hostsParams () {
      const ret = {
        scope: this.scope,
        host_type: 'hypervisor',
        limit: 20,
        enabled: 1,
        host_status: 'online',
        server_id_for_network: this.firstData.id,
        os_arch: this.firstData.os_arch,
      }
      if (this.isAdminMode && this.isSingle) {
        ret.project_domain = this.params.data[0].domain_id
      }
      return ret
    },
  },
  methods: {
    hostsMapper (data) {
      if (this.isSingle) {
        data = data.filter(item => item.id !== this.firstData.host_id)
      }
      return data
    },
    doSingleTransfer (ids, values) {
      let action = 'migrate'
      const data = {
        prefer_host: values.host,
      }
      if (this.firstData.status === 'ready') {
        data.auto_start = values.auto_start
      }
      if (this.firstData.status !== 'running') {
        action = 'migrate'
      } else {
        action = 'live-migrate'
      }
      if (values.rescue_mode) {
        action = 'migrate'
        data.rescue_mode = true
      }
      return this.params.onManager('performAction', {
        id: this.firstData.id,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action,
          data,
        },
      })
    },
    doBatchTransfer (ids, values) {
      const data = {
        guest_ids: ids,
        prefer_host: values.host,
      }
      return this.params.onManager('performClassAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'batch-migrate',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        if (this.isSingle) {
          await this.doSingleTransfer(ids, values)
        } else {
          await this.doBatchTransfer(ids, values)
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
