<template>
  <base-dialog @cancel="cancelDialog" v-show="show">
    <div slot="header">{{$t('dashboard.text_105')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.image')" :count="params.data.length" :action="$t('dashboard.text_105')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-spin :spinning="loading">
        <a-form :form="form" v-bind="formItemLayout">
          <a-form-item :label="$t('compute.text_640')">
            <a-radio-group v-decorator="decorators.format">
              <a-radio
                v-for="o in formatOptions"
                :key="o.key"
                :value="o.key">
                {{ o.label }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('compute.image.export')">
            <a-radio-group v-model="isDownload">
              <a-radio :value="true">
                {{ $t('compute.image.export.file') }}
              </a-radio>
              <a-radio :value="false">
                {{ $t('compute.image.export.url') }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </a-spin>
      <a ref="imageButton" download :id="params.data[0].id" v-show="false" />
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
  name: 'ImageExportDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const m = new this.$Manager('images', 'v1')
    return {
      loading: true,
      isDownload: true,
      manager: m,
      show: true,
      formatOptions: [],
      form: this.$form.createForm(this),
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      decorators: {
        format: [
          'format',
          {
            rules: [{ required: true, message: this.$t('compute.text_148', [this.$t('compute.text_640')]) }],
          },
        ],
      },
    }
  },
  created () {
    this.fetchFormats()
  },
  methods: {
    fetchFormats () {
      try {
        this.loading = true
        this.manager.getSpecific({
          id: this.params.data[0].id,
          spec: 'subformats',
        }).then(({ data }) => {
          this.formatOptions = data.filter((item) => { return item.status === 'active' }).map((item) => {
            return { key: item.format, label: item.format.toUpperCase() }
          })
          if (this.formatOptions.length > 1) {
            this.form.setFieldsValue({ format: this.formatOptions[0].key })
          }
          this.$nextTick(() => {
            this.loading = false
          })
        })
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async getDownloadUrl (params) {
      const { data } = await new this.$Manager('imageutils', 'v1').getSpecific({ id: 'download', spec: this.params.data[0].id, params })
      let name = this.params.data[0].name || this.params.data[0].id
      if (params && params.format) {
        name = name + '.' + params.format
      }
      return '/api/v1/imageutils/image/' + name + '?signature=' + data.signature
    },
    async fetchUrl (params) {
      try {
        const path = await this.getDownloadUrl(params)
        this.createDialog('ImageExportUrlDialog', {
          url: window.location.protocol + '//' + window.location.host + path,
          cancel: this.cancelDialog,
        })
        this.show = false
      } catch (error) {
        throw error
      }
    },
    async download (params) {
      const path = await this.getDownloadUrl(params)
      this.$refs.imageButton.href = path
      this.$refs.imageButton.click()
      this.cancelDialog()
    },
    async handleConfirm () {
      try {
        this.loading = true
        const values = await this.form.validateFields()
        if (this.isDownload) {
          await this.download(values)
        } else {
          await this.fetchUrl(values)
        }
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

<style scoped>

</style>
