<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_202')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.eip')" :count="params.data.length" :action="$t('network.text_202')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('network.eip.instance_type')">
          <a-radio-group v-decorator="decorators.instance_type" @change="onAssociateTypeChanged">
            <a-radio-button value="server">{{$t('network.eip.instance_type.server')}}</a-radio-button>
            <a-radio-button value="natgateway" :disabled="isNatDisabled">{{$t('network.eip.instance_type.nat')}}</a-radio-button>
            <a-radio-button value="loadbalancer" :disabled="isLbDisabled">{{$t('network.eip.instance_type.lb')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="resource_label">
          <base-select
            :remote="true"
            v-decorator="decorators.instance_id"
            :resource="resource"
            :params="instanceParams"
            :remote-fn="q => ({ search: q })"
            :select-props="{ placeholder: $t('network.text_203') }" />
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
  name: 'EipBindServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      resource: 'servers',
      resource_label: this.$t('dictionary.server'),
      decorators: {
        instance_type: [
          'instance_type',
          {
            initialValue: 'server',
          },
        ],
        instance_id: [
          'instance_id',
          {
            rules: [
              { required: true, message: this.$t('network.text_204') },
            ],
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
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
    instanceParams () {
      const params = {
        details: true,
        with_meta: true,
        scope: this.scope,
      }
      if (this.resource === 'servers') {
        params.filter = 'status.in(ready, running)'
        params.without_eip = true
        params.eip_associable = true
        params.usable_server_for_eip = this.params.data[0].id // 过滤出允许挂载EIP的虚拟机
      } else if (this.resource === 'natgateways') {
        params.filter = 'status.in("available")'
        params.cloudregion_id = this.params.data[0].cloudregion_id
      } else if (this.resource === 'loadbalancers') {
        // params.filter = 'status.in(ready)'
        params.without_eip = true
        params.eip_associable = true
        params.usable_loadbalancer_for_eip = this.params.data[0].id
      }
      if (this.isAdminMode || this.isDomainMode) params.project_id = this.params.data[0].project_id
      return params
    },
    isNatDisabled () {
      if (this.params.data[0].provider === 'Aliyun') {
        return false
      }
      return true
    },
    isLbDisabled () {
      if (['OneCloud', 'Huawei'].includes(this.params.data[0].provider)) {
        return false
      }
      return true
    },
  },
  methods: {
    onAssociateTypeChanged (e) {
      if (e.target.value === 'server') {
        this.resource = 'servers'
        this.resource_label = this.$t('dictionary.server')
      } else if (e.target.value === 'natgateway') {
        this.resource = 'natgateways'
        this.resource_label = this.$t('dictionary.nat')
      } else if (e.target.value === 'loadbalancer') {
        this.resource = 'loadbalancers'
        this.resource_label = 'LB'
      }
    },
    doBind (data) {
      return this.params.onManager('performAction', {
        id: data.id,
        managerArgs: {
          action: 'associate',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          id: this.params.data[0].id,
        }
        this.loading = true
        await this.doBind(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
