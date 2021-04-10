<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-alert class="mb-2" :message="$t('compute.text_1354')" banner />
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.text_1355')" :name="params.name" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_1356')" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.auto_start" :checked-children="$t('compute.text_115')" :un-checked-children="$t('compute.text_116')" />
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
  name: 'RollbackHostDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        auto_start: [
          'auto_start',
          {
            valuePropName: 'checked',
            initialValue: true,
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
    columns () {
      const showFields = ['name', 'guest', 'brand']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    doRollback (data) {
      const guestId = this.params.data[0] && this.params.data[0].guest_id
      return new this.$Manager('servers').performAction({
        action: 'instance-snapshot-reset',
        id: guestId,
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        values.instance_snapshot = this.params.data[0].id
        await this.doRollback(values)
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
