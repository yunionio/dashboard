<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">扩容</div>
    <div slot="body">
      <a-alert type="warning" class="mb-2">
        <template #message>
          <div>
            <p>扩容须知：</p>
            <p>1.扩容时，容量只能增加不能减小；</p>
            <p v-show="params.data[0].provider === 'Aliyun'">2.阿里云扩容后须重启服务器生效；</p>
            <p v-show="params.data[0].provider === 'Aws'">2.AWS扩容后，下次扩容需要6个小时之后操作，否则会扩容失败；</p>
            <p v-show="!params.data[0].provider">2.私有云扩容后立即生效，无需重启服务器。</p>
          </div>
        </template>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" action="扩容" name="硬盘" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="容量" v-bind="formItemLayout">
          <a-input-number :min="(params.data[0].disk_size / 1024) || 1" :max="100000" step="10" v-decorator="decorators.size" /> GB
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
  name: 'CapacityUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        size: [
          'size',
          {
            initialValue: this.params.data[0].disk_size / 1024,
            rules: [
              { required: true, message: '请输入容量大小' },
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
    doCreate (data) {
      return new this.$Manager('disks').performAction({
        id: this.params.data[0].id,
        action: 'resize',
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.validateForm()
        values = {
          ...values,
          size: values.size * 1024,
        }
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.params.list.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
