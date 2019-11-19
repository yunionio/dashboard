<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更改项目</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="更改项目" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="项目" v-bind="formItemLayout">
          <domain-project
            :fc="form.fc"
            :form-layout="formItemLayout"
            :labelInValue="false"
            :decorators="{ project: decorators.project, domain: decorators.domain }" />
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
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'ChangeOwenrDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, { name: 'change_project_form' }),
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { required: true, message: '请选择域', trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { required: true, message: '请选择项目', trigger: 'change' },
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.params.data.map(item => item.id)
        await this.params.list.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'change-owner',
            data: values,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
