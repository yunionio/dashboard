<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk_perform_resize')}}</div>
    <div slot="body">
      <a-alert type="warning" class="mb-2">
        <template #message>
          <div>
            <p>{{$t('compute.text_403')}}</p>
            <p>{{$t('compute.text_404')}}</p>
            <!-- <p v-show="params.data[0].provider === 'Aliyun'">{{$t('compute.text_405')}}</p> -->
            <p v-show="params.data[0].provider === 'Aws'">{{$t('compute.text_406')}}</p>
            <p v-show="!params.data[0].provider">{{$t('compute.text_407')}}</p>
          </div>
        </template>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.disk_perform_resize')" :name="$t('dictionary.disk')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_397')" v-bind="formItemLayout">
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
  name: 'DiskCapacityUpdateDialog',
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
              { required: true, message: this.$t('compute.text_408') },
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
    // 对于已经挂载了虚拟机的磁盘扩容
    doCreate2 (data) {
      return new this.$Manager('servers').performAction({
        id: this.params.data[0].guests[0].id,
        action: 'resize-disk',
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
        if (this.params.data[0].guest_count && this.params.data[0].guest_count >= 1) {
          await this.doCreate2({
            disk: this.params.data[0].id,
            size: values.size,
          })
        } else {
          await this.doCreate(values)
        }

        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
