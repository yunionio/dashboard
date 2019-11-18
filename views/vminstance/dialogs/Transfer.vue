<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">迁移</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" message="提示信息：宿主机为空时，系统会自动选择宿主机" />
      <dialog-selected-tips :count="params.data.length" action="迁移" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="宿主机" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.host"
            resource="hosts"
            filterable
            remote
            :params="hostsParams"
            :mapper="hostsMapper"
            :select-props="{ allowClear: true, placeholder: '请选择宿主机' }" />
        </a-form-item>
        <a-form-item label="强制迁移" v-bind="formItemLayout" v-if="isSingle">
          <a-switch v-decorator="decorators.rescue_mode" />
        </a-form-item>
        <a-form-item label="自动启动" v-bind="formItemLayout" v-if="isSingle && firstData.status === 'ready'" extra="迁移成功后自动启动">
          <a-switch v-decorator="decorators.auto_start" />
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
              { required: true, message: '请选择宿主机', trigger: 'change' },
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
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope']),
    firstData () {
      return this.params.data[0]
    },
    isSingle () {
      return this.params.data.length === 1
    },
    hostsParams () {
      return {
        scope: this.scope,
        host_type: 'hypervisor',
        limit: 20,
        enabled: 1,
      }
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
      return this.params.list.onManager('performAction', {
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
      return this.params.list.onManager('performClassAction', {
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
