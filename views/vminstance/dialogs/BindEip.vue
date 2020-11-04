<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1179')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1179')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('compute.text_1180')" v-bind="formItemLayout">
          <eip-config
            hidden-none-type
            :decorators="decorators.eipConfig"
            :eip-params="eipParams"
            :hypervisor="hypervisor"
            :form="form" />
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
import { SERVER_TYPE } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'VmBindEipDialog',
  components: {
    EipConfig,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let typeInitialValue = 'new'
    const hypervisor = this.params.data[0].hypervisor
    if (findPlatform(hypervisor) === SERVER_TYPE.private) {
      typeInitialValue = 'bind'
    }
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
              initialValue: typeInitialValue,
            },
          ],
          charge_type: [
            'charge_type',
            {
              initialValue: this.params.data[0].hypervisor === 'kvm' ? 'bandwidth' : 'traffic',
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
      return this.params.data[0].hypervisor
    },
    isPublic () {
      return findPlatform(this.hypervisor) === 'public'
    },
    eipParams () {
      return {
        usable_eip_for_associate_type: 'server',
        usable_eip_for_associate_id: this.params.data[0].id,
        scope: this.$store.getters.scope,
      }
    },
    columns () {
      const fields = ['name', 'metadata', 'ip']
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
          steadyStatus: ['running', 'ready'],
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
        this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
