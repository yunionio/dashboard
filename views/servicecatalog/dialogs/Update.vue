<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更新服务</div>
    <div slot="body">
      <servicecatalog-form v-if="decorators" ref="formRef" :decorators="decorators" :form="form" />
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
import { rollupFormData } from '@/utils/common/ant'

export default {
  name: 'UpdateServicecatalogDialog',
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
      initDecorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
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
      decorators: null,
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        const { data } = await this.params.list.onManager('get', {
          managerArgs: { id: this.params.data[0].id },
        })
        this.data = data
        this.decorators = rollupFormData(this.data, this.initDecorators, { guest_template: 'guest_template_id' })
      } catch (error) {
        this.$message.error('获取服务详情出错，请稍后再试')
        throw error
      }
    },
    doUpdate (data) {
      return this.params.list.singleUpdate(this.params.data[0].id, data)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.$refs.formRef.validateFields()
        await this.doUpdate(values)
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
