<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.read_only')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.cloudaccount')" :count="params.data.length" :action="$t('cloudenv.read_only')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <read-only :form="form" :checked="checked" />
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
import ReadOnly from '@Cloudenv/views/cloudaccount/components/ReadOnly'

export default {
  name: 'CloudaccountSetReadOnlyDialog',
  components: {
    ReadOnly,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.data[0]
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        read_only: [
          'read_only',
          {
            initialValue: data.read_only,
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
  computed: {
    checked () {
      return this.params?.data[0]?.read_only || false
    },
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
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        if (ids.length > 1) {
          await this.params.onManager('batchUpdate', {
            ids,
            managerArgs: {
              data: values,
            },
          })
        } else {
          await this.params.onManager('update', {
            id: ids[0],
            managerArgs: {
              data: values,
            },
          })
        }
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
