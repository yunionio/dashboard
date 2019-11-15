<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">加入资源池</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          提示：加入资源池的公有云服务器可至基础设施-》服务器-》包年包月查询
        </div>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" action="加入资源池" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item v-bind="formItemLayout">
          <a-checkbox v-decorator="decorators.autoDestroy">
            自动销毁该主机
          </a-checkbox>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmJoinResourceDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        autoDestroy: [
          'autoDestroy',
          {
            initialValue: true,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 12,
        },
      },
    }
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doJoinResourceSubmit (data) {
      const selectedIds = this.params.data.map(item => item.id)
      return this.params.list.onManager('batchPerformAction', {
        id: selectedIds,
        managerArgs: {
          action: 'prepaid-recycle',
          data: {
            auto_delete: data.autoDestroy,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.doJoinResourceSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
