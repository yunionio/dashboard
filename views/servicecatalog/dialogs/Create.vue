<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建服务目录</div>
    <div slot="body">
      <servicecatalog-form ref="formRef" :decorators="decorators" :form="form" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import ServicecatalogForm from '../components/Form'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CreateServicecatalogDialog',
  components: {
    ServicecatalogForm,
  },
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
              { required: true, message: '请选择主机模板' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: [
          'description',
          {
            rules: [
              { type: 'string', min: 0, max: 128, message: '请输入0-128个字符以内' },
            ],
          },
        ],
        guest_template: [
          'guest_template',
          {
            rules: [
              { required: true, message: '请选择主机模板' },
            ],
          },
        ],
        icon_url: [
          'icon_url',
          {
            rules: [
              { required: true, message: '请输入图标地址' },
              { validator: this.$validate('url') },
            ],
          },
        ],
      },
    }
  },
  methods: {
    doCreate (data) {
      return new this.$Manager('servicecatalogs').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.$refs.formRef.validateFields()
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
