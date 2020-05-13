<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.formType === 'update' ? '修改' : '新建'}}</div>
    <div slot="body">
      <dialog-selected-tips v-if="params.data" :count="params.data.length" name="Helm仓库地址" action="修改" />
      <dialog-table v-if="params.columns" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item label="名称">
          <a-input v-decorator="decorators.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item label="URL">
          <a-input v-decorator="decorators.url" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="类型">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button
              v-for="item in typeOpts"
              :value="item.key"
              :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="是否为公有" v-if="$store.getters.isAdminMode">
          <a-switch v-decorator="decorators.is_public" />
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
  name: 'ChartCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initialValue = {}
    if (this.params.data && this.params.data[0]) {
      initialValue.name = this.params.data[0].name
      initialValue.url = this.params.data[0].url
      initialValue.is_public = this.params.data[0].is_public
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      typeOpts: [
        { key: 'internal', label: '虚拟机类型' },
        { key: 'external', label: '容器类型' },
      ],
      decorators: {
        name: [
          'name',
          {
            initialValue: initialValue.name,
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        type: [
          'type',
          {
            initialValue: 'internal',
          },
        ],
        url: [
          'url',
          {
            initialValue: initialValue.url,
            validateFirst: true,
            rules: [
              { required: true, message: '请输入URL', trigger: 'blur' },
              { validator: this.$validate('url') },
            ],
          },
        ],
        is_public: [
          'is_public',
          {
            initialValue: initialValue.is_public,
            valuePropName: 'checked',
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
    async doCreate (data) {
      try {
        if (this.params.formType === 'update') {
          return await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data,
            },
          })
        } else {
          return this.params.onManager('create', {
            managerArgs: {
              data,
            },
          })
        }
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        await this.doCreate(values)
        if (this.params.refresh) this.params.refresh()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
