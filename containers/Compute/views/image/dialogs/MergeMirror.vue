<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.image.merge_mirror') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('common_238')" :count="params.data.length" :action="$t('compute.image.merge_mirror')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_228')" :extra="$t('compute.image.merge_mirror.extra')">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.image.merge_mirror.placeholder')" />
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
  name: 'MergeMirrorDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('compute.text_660') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    columns () {
      return this.params.columns.filter(item => ['name', 'tenant'].includes(item.field))
    },
  },
  methods: {
    doAction (data) {
      return new this.$Manager('guestimages', 'v1').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const images = this.params.data
        const data = { images, name: values.name }
        await this.doAction(data)
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
