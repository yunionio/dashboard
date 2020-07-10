<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">创建订阅</div>
    <div slot="body">
      <a-alert class="mb-3" type="warning">
        <template slot="message">
          <div>
            创建订阅需要满足以下2个条件：
          </div>
          <div>1.国际区的云账号，中国大陆地区的云账号不支持该操作 </div>
          <div>2.录入的APP必须被授予Owner的权限，操作步骤请点击查看帮助  <help-link href="/">详情</help-link></div>
        </template>
      </a-alert>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="EA账号">
          <base-select
            showSync
            isDefaultSelect
            idKey="name"
            :resource="`cloudaccounts/${params.data.id}/enrollment-accounts`"
            v-decorator="decorators.enrollmentAccountId"
            :selectProps="{ 'placeholder': '请选择EA账号' }" />
            <div slot="extra">
              需要指定使用哪个EA账号创建订阅
            </div>
        </a-form-item>
        <a-form-item label="订阅名称">
          <a-input v-decorator="decorators.name" placeholder="请输入订阅名称" />
        </a-form-item>
        <a-form-item label="用途">
          <a-select v-decorator="decorators.offerType" placeholder="请选择用途">
            <a-select-option value="MS-AZR-0017P">
              生产
            </a-select-option>
            <a-select-option value="MS-AZR-0148P">
              开发/测试
            </a-select-option>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'cloudproviderCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
            ],
          },
        ],
        enrollmentAccountId: [
          'enrollmentAccountId',
          {
            rules: [
              { required: true, message: '请选择EA账号' },
            ],
          },
        ],
        offerType: [
          'offerType',
          {
            initialValue: 'MS-AZR-0017P',
            rules: [
              { required: true, message: '请选择用途' },
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await new this.$Manager('cloudaccounts').performAction({
          id: this.params.data.id,
          action: 'create-subscription',
          data: values,
        })
        this.params.refresh()
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
