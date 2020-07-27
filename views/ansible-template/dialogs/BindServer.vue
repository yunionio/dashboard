<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.ansibletemplate')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form class="mt-3" :form="form" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_90')">
          <a-select v-decorator="decorators.server_id"  mode="multiple" :loading="queryServerLoading" style="width: 100%" :placeholder="$t('compute.text_256')">
            <a-select-option :key="item.id" v-for="item in serverList" :value="item.id">{{item.name}}</a-select-option>
          </a-select>
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
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AnsibleTemplateBindServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: this.$form.createForm(this),
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      serverList: [],
      queryServerLoading: false,
    }
  },
  computed: {
    decorators () {
      return {
        server_id: [
          'server_id',
          {
            rules: [
              { required: true, message: this.$t('compute.text_256') },
            ],
          },
        ],
      }
    },
  },
  created () {
    this.fetchQueryServers()
  },
  methods: {
    async fetchQueryServers () {
      const manager = new this.$Manager('servers')
      const params = {
        limit: 0,
        usable: true,
        details: true,
        scope: this.$store.getters.scope,
      }
      this.queryServerLoading = true
      try {
        const { data } = await manager.list({ params })
        this.serverList = data.data
      } catch (err) {
        throw err
      } finally {
        this.queryServerLoading = false
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      const manager = new this.$Manager('devtool_templates')
      this.loading = true
      try {
        const values = await this.validateForm()
        await manager.performAction({
          id: this.params.data[0].id,
          action: 'bind',
          data: values,
        })
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
