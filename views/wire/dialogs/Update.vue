<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">修改属性</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.wire')" :count="params.data.length" action="修改属性" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="带宽" v-bind="formItemLayout">
          <a-select
              v-decorator="decorators.bandwidth"
              placeholder="网络带宽">
            <a-select-option v-for="item in bandwidthOptions" :value="item.value" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="MTU" v-bind="formItemLayout">
          <a-input-number :min="68" :max="9216" :step="50" v-decorator="decorators.mtu" />
          <div class="add-desc">网络传输数据包的大小，MTU参数的范围在 <b>68字节</b> ~ <b>9216字节</b>，通常设置为1500</div>
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
import { BAND_WIDTH_OPTION } from '../../../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WireUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        bandwidth: [
          'bandwidth',
          {
            initialValue: this.params.data[0].bandwidth.toString(),
            rules: [
              { required: true, message: '请选择带宽' },
            ],
          },
        ],
        mtu: [
          'mtu',
          {
            initialValue: this.params.data[0].mtu || 1500,
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
      bandwidthOptions: BAND_WIDTH_OPTION,
    }
  },
  methods: {
    doUpdate (data) {
      return new this.$Manager('wires').update({
        id: this.params.data[0].id,
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped lang="less">
  .add-desc{
    font-size: 12px;
    b{
      color: #333333;
    }
  }
</style>
