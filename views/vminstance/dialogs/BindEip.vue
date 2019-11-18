<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">绑定弹性公网IP</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="绑定弹性公网IP" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="绑定方式" v-bind="formItemLayout">
          <eip-config
            hidden-none-type
            :decorators="decorators.eipConfig"
            :eip-params="eipParams"
            :hypervisor="hypervisor" />
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
import EipConfig from '@Compute/sections/EipConfig'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmBindEipDialog',
  components: {
    EipConfig,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        eipConfig: {
          type: [
            'type',
            {
              initialValue: 'bind',
            },
          ],
          charge_type: [
            'charge_type',
            {
              initialValue: 'traffic',
            },
          ],
          bandwidth: [
            'bandwidth',
          ],
          eip: [
            'eip',
            {
              rules: [
                { required: true, message: '请选择弹性公网IP', trigger: 'change' },
              ],
            },
          ],
        },
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
    hypervisor () {
      return this.params.data[0]['hypervisor']
    },
    eipParams () {
      return {
        usable_eip_for_associate_type: 'server',
        usable_eip_for_associate_id: this.params.data[0]['id'],
        project: this.params.data[0]['tenant_id'],
      }
    },
  },
  methods: {
    doCreateEip (ids, values) {
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'create-eip',
          steadyStatus: ['running', 'ready'],
          data: {
            charge_type: values.charge_type,
            bandwidth: values.bandwidth,
          },
        },
      })
    },
    doBindEip (ids, values) {
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'associate-eip',
          steadyStatus: ['running', 'ready'],
          data: {
            eip: values.eip,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        if (values.type === 'new') {
          await this.doCreateEip(ids, values)
        }
        if (values.type === 'bind') {
          await this.doBindEip(ids, values)
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
