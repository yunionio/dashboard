<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_202')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.eip')" :count="params.data.length" :action="$t('network.text_202')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('dictionary.server')" v-bind="formItemLayout">
          <base-select
            :remote="true"
            v-decorator="decorators.instance_id"
            resource="servers"
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
      decorators: {
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
        usable_server_for_eip: this.params.data[0].id,
        filter: 'status.in(ready, running)',
        without_eip: true,
        details: true,
        with_meta: true,
        scope: this.scope,
        eip_associable: true, // 过滤出允许挂载EIP的虚拟机
      }
      if (this.isAdminMode || this.isDomainMode) params.project_id = this.params.data[0].project_id
      return params
    },
  },
  methods: {
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
