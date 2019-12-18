<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">修改属性</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="修改属性" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 2)" />
       <a-form
        :form="form.fc">
        <a-form-item label="CPU超售比" v-bind="formItemLayout">
          <a-input-number v-decorator="decorators.cpu_cmtbound" :min="0" :step="0.1" />
        </a-form-item>
        <a-form-item label="内存超售比" v-bind="formItemLayout">
          <a-input-number v-decorator="decorators.mem_cmtbound" :min="0" :max="1" :step="0.1" />
          <div style="font-size:12px" class="add-desc">默认为1，推荐0.8或0.9（预留少许给宿主机系统服务）</div>
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
  name: 'HostAdjustOversoldRatioDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cpu_cmtbound: [
          'cpu_cmtbound',
          {
            initialValue: this.params.data[0].cpu_cmtbound,
            rules: [
              {
                required: true,
                message: '请填写cpu超售比',
              },
            ],
          },
        ],
        mem_cmtbound: [
          'mem_cmtbound',
          {
            initialValue: this.params.data[0].mem_cmtbound,
            rules: [
              {
                required: true,
                message: '请填写内存超售比',
              },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  methods: {
    doUpdate (data) {
      return this.params.list.onManager('batchUpdate', {
        id: this.params.data[0].id,
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          name: this.params.data[0].name,
        }
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
