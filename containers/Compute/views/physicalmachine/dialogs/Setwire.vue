<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_843')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.physicalmachine')" :count="params.data.length" :action="$t('compute.text_843')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 5)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_844')" v-bind="formItemLayout" v-if="!selectWire">
          <base-select
            :filterable="true"
            v-decorator="decorators.wire"
            resource="wires"
            version="v1"
            :params="wireParams"
            :value="selectWire"
            :select-props="{ placeholder: $t('compute.text_845') }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_844')" v-if="!!selectWire">
          {{ params.data[0].wire }}
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button v-if="!selectWire" type="primary" @click="handleConfirm(true)" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button v-if="!!selectWire" type="primary" @click="handleConfirm(false)">{{ $t('compute.text_354') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostSetWireDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        wire: [
          'wire',
          {
            rules: [
              { required: true },
            ],
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
      wireParams: {
        host_id: this.params.data[0].hostId,
      },
      selectWire: this.params.data[0].wire_id,
    }
  },
  methods: {
    fetchHost () {
      return new this.$Manager('hosts').get({
        id: this.params.data[0].hostId,
      })
    },
    doUpdate (data) {
      return new this.$Manager('hosts').performAction({
        action: 'add-netif',
        id: this.params.data[0].hostId,
        data: {
          ...data,
          mac: this.params.data[0].mac,
          index: this.params.data[0].index,
        },
      })
    },
    async handleConfirm (add) {
      this.loading = true
      try {
        this.loading = true
        if (add) {
          const values = await this.form.fc.validateFields()
          await this.doUpdate(values)
        } else {
          await this.unsetWire()
        }
        this.loading = false
        this.cancelDialog()
        this.$nextTick(
          () => {
            this.fetchHost().then(
              (host) => {
                this.params.saveHostInfo(host.data)
              },
            )
          },
        )
      } catch (error) {
        this.loading = false
      }
    },
    unsetWire () {
      console.log(this.params)
      new this.$Manager('wires').delete({
        id: this.selectWire,
        ctx: [['hosts', this.params.data[0].hostId]],
        params: {
          mac: this.params.data[0].mac,
          mac_addr: this.params.data[0].mac,
        },
      })
    },
  },
}
</script>
