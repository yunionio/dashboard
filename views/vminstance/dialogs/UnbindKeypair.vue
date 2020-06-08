<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">解绑密钥</div>
    <div slot="body">
      <a-alert class="mb-2" v-if="isOpenStack" message="OpenStack机器在解绑密钥后需手动重置密码" type="warning" />
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" action="解绑密钥" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="自动启动" v-bind="formItemLayout" extra="解绑密钥成功后是否自动启动">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.auto_start" :disabled="form.fi.disableAutoStart" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmUnbindKeypairDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let autoStartInitialValue = true
    let disableAutoStart = false
    const firstData = this.params.data && this.params.data[0]
    if (firstData && (firstData.status === 'running' || firstData.hypervisor === hypervisorMap.azure.key)) {
      autoStartInitialValue = false
      disableAutoStart = true
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          disableAutoStart,
        },
      },
      decorators: {
        auto_start: [
          'auto_start',
          {
            initialValue: autoStartInitialValue,
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
    isOpenStack () {
      return this.params.data[0].hypervisor === hypervisorMap.openstack.key
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        values.__delete_keypair__ = true
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'deploy',
            data: values,
          },
        })
        this.$bus.$emit('VMInstanceListSingleUpdate', [this.params.data[0].id])
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
