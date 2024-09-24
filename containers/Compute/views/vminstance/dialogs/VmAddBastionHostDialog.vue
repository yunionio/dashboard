<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.bastionHost.add_bastion_host') }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <bastion-host
          :decorator="decorator.bastion_host"
          :inDialog="true" />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import BastionHost from '@Compute/views/vminstance/create/components/BastionHost'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { uuid } from '@/utils/utils'

export default {
  name: 'VmAddBastionHostDialog',
  components: {
    BastionHost,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      decorator: {
        bastion_host: {
          bastion_host_enable: [
            'bastion_host_enable',
            {
              valuePropName: 'checked',
              initialValue: false,
            },
          ],
          bastion_host_id: [
            'bastion_host_id',
            {
              rules: [
                { required: true, message: this.$t('compute.bastionHost.bastion_host.placeholder') },
              ],
            },
          ],
          nodes: [
            'nodes',
            {
              rules: [
                { required: true, message: this.$t('compute.bastionHost.node.placeholder') },
              ],
            },
          ],
          port: [
            'port',
            {
              initialValue: 22,
              rules: [
                { type: 'number', min: 0, max: 65535, message: this.$t('compute.bastionHost.port.placeholder'), trigger: 'blur', transform: (v) => parseInt(v) },
              ],
            },
          ],
          privileged_accounts: [
            'privileged_accounts',
            {
              rules: [
                { required: true, message: this.$t('compute.bastionHost.privileged_account.placeholder') },
              ],
            },
          ],
          accounts: [
            'accounts',
            {
              rules: [
                { required: true, message: this.$t('compute.bastionHost.account.placeholder') },
              ],
            },
          ],
          bastion_domain_id: [
            'bastion_domain_id',
          ],
        },
      },
    }
  },
  methods: {
    async handleConfirm () {
      try {
        const curItem = this.params.data[0]
        const bsManager = new this.$Manager('bastion_servers')
        const values = await this.form.fc.validateFields()
        this.loading = true
        const data = {
          bastion_host_id: values.bastion_host_id,
          nodes: values.nodes,
          port: values.port,
          accounts: [values.privileged_accounts].concat(values.accounts),
          server_id: curItem.id,
          name: curItem.name,
          os_type: curItem.os_type,
          bastion_domain_id: values.bastion_domain_id,
        }
        bsManager.create({ data, params: { $t: uuid() } })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
