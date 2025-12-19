<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ $t('common.update') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.mounted_apps')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('aice.mounted_apps.mounts')">
          <a-textarea v-decorator="decorators.mounts" :placeholder="mountsExample" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
        <a-form-item :label="$t('aice.template')">
          <base-select
            v-decorator="decorators.image_id"
            resource="images"
            :params="templateParams"
            filterable
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.template')]) }" />
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'PhoneImageUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
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
        mounts: [
          'mounts',
          {
            initialValue: this.params.data[0].mounts.join('\n'),
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.mounted_apps.mounts')]) },
            ],
          },
        ],
        image_id: [
          'image_id',
          {
            initialValue: this.params.data[0].image_id,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.template')]) },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    columns () {
      const showFields = ['name', 'package', 'version', 'image']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    mountsExample () {
      return '/data/app/~~AiggKR4DW03_Ue4jSG2YmQ==\n/data/data/com.ss.android.ugc.aweme\n/data/media/0/Android/data/com.ss.android.ugc.aweme'
    },
    templateParams () {
      const ret = {
        scope: this.scope,
        'disk_formats.0': 'tgz',
        details: false,
      }
      return ret
    },
  },
  methods: {
    async handleConfirm () {
      try {
        const values = await this.form.fc.validateFields()
        const manager = new this.$Manager('instant_apps', '')
        const mountPaths = values.mounts.split('\n')
        const data = {
          mounts: mountPaths,
          image_id: values.image_id,
        }
        manager.update({
          id: this.params.data[0].id,
          data: data,
        })
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
      this.params.callback && this.params.callback()
      this.cancelDialog()
      this.params.refresh && this.params.refresh()
    },
  },
}
</script>
