<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.add_to_bastion')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.add_to_bastion')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <bastion-host :decorator="decorators.bastion_host" :form="form" inDialog />
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
import { getInitialValue } from '@/utils/common/ant'
import { Decorator } from '@Compute/utils/createServer'
import { SERVER_TYPE } from '@Compute/constants'
import BastionHost from '../create/components/BastionHost'

export default {
  name: 'VmAddToBastionDialog',
  components: {
    BastionHost,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const decorators = new Decorator(SERVER_TYPE.idc).createDecorators()
    const initFd = getInitialValue(decorators)
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          ...initFd,
        },
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      decorators,
    }
  },
  computed: {
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await new this.$Manager('bastion_servers').create({
          data: {
            ...values,
            server_id: this.params.data[0].id,
            generate_name: this.params.data[0].name,
          },
        })
        this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
