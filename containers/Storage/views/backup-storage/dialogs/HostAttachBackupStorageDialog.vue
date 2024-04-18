<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.blockstorage')" :count="params.data.length" :action="this.params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('storage.text_50')">
          <a-select :loading="hostsLoading" allowClear showSearch :filterOption="filterOption" mode="multiple" v-decorator="decorators.host" :placeholder="$t('storage.text_51')">
            <a-select-option v-for="item in hosts" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostAttachBackupStorageDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      hostsLoading: false,
      hosts: [],
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
    }
  },
  computed: {
    decorators () {
      return {
        host: [
          'host',
          {
            rules: [
              { required: true, message: this.$t('storage.text_54') },
            ],
          },
        ],
      }
    },
  },
  created () {
    this.queryHostList()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async queryHostList () {
      const params = { hypervisor: 'kvm', storage_not_attached: true, backupstorage: this.params.data[0].id }
      const manager = new this.$Manager('hosts', 'v2')
      this.hostsLoading = true
      try {
        const { data = {} } = await manager.list({ params })
        this.hosts = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.hostsLoading = false
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const manager = new this.$Manager('hosts', 'v2')
        await manager.batchPerformAction({
          ids: values.host,
          action: '',
          data: values,
          ctx: [['backupstorages', this.params.data[0].id]],
        })
        this.cancelDialog()
        this.params.refresh()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
