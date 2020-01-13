<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" name="块存储" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="宿主机">
          <!-- <a-input placeholder="请输入名称" v-decorator="decorators.name" /> -->
          <a-select :loading="hostsLoading" allowClear showSearch :filterOption="filterOption" mode="multiple" v-decorator="decorators.host" placeholder="请选择宿主机（可多选）">
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
  name: 'AssociatedHostDialog',
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
              { required: true, message: '请a选择宿主机' },
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
      const params = { hypervisor: 'kvm', storage_not_attached: true, storage: this.params.data[0].id }
      const manager = new this.$Manager('hosts', 'v2')
      this.hostsLoading = true
      try {
        const { data = {} } = await manager.list({ data: params })
        this.hosts = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.hostsLoading = false
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          resolve(values)
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = this.validateForm()
        const manager = new this.$Manager('storages', 'v2')
        await manager.batchPerformAction({
          ids: values.hosts,
          managerArgs: {
            action: 'host',
            // data: ,
          },
        })
        this.cancelDialog()
        this.params.list.fetchData()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
