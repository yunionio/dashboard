<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1179')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('network.text_714')" :count="params.data.length" :action="$t('compute.text_1179')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark>
        <eip-config
          hidden-none-type
          :decorators="decorators.eipConfig"
          :eip-params="eipParams"
          :hypervisor="hypervisor"
          :cloud-env="params.data[0].cloud_env"
          :form="form"
          :formItemLayout="formItemLayout"
          :show-new="eipBindNew" />
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
  name: 'LbBindEipDialog',
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
              initialValue: this.params.data[0].brand === 'OneCloud' ? 'new' : 'bind',
            },
          ],
          charge_type: [
            'charge_type',
            {
              initialValue: 'bandwidth',
            },
          ],
          bgp_type: [
            'bgp_type',
            {
              initialValue: '',
            },
          ],
          bandwidth: [
            'bandwidth',
            {
              initialValue: 30,
              validateFirst: true,
            },
          ],
          eip: [
            'eip',
            {
              rules: [
                { required: true, message: this.$t('compute.text_145'), trigger: 'change' },
              ],
            },
          ],
        },
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
    eipParams () {
      return {
        usable_eip_for_associate_type: 'loadbalancer',
        usable_eip_for_associate_id: this.params.data[0].id,
        scope: this.$store.getters.scope,
      }
    },
    eipBindNew () {
      return this.params.data[0].brand === 'OneCloud'
    },
    columns () {
      const fields = ['name', 'vpc', 'address']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
  },
  methods: {
    doCreateEip (ids, values) {
      return this.params.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'create-eip',
          data: {
            charge_type: values.charge_type,
            bandwidth: values.bandwidth,
            bgp_type: values.bgp_type,
          },
        },
      })
    },
    doBindEip (ids, values) {
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['enabled'],
        managerArgs: {
          action: 'associate-eip',
          data: {
            eip_id: values.eip,
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
