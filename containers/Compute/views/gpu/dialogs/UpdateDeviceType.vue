<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更新设备类型</div>
    <div slot="body">
      <a-alert type="warning" class="mb-2">
        <template v-slot:message>
          <div class="messages-list">
            <p>GPU-HPC: 高性能计算卡（High-Performance Computing），主要用于进行科学计算、数据分析、机器学习等需要大规模并行计算的任务。</p>
            <p>GPU-VGA: 视频图形处理卡（Video Graphics Array），用于图形渲染和显示的目的。</p>
            <p>GPU-VGA 类型的 GPU 卡透传给虚机使用时，不在提供模拟的 VGA 设备，需要在镜像内提前安装好显卡驱动。</p>
          </div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="$t('compute.text_113')" :count="params.data.length" action="更新设备类型" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item label="设备类型">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button value="GPU-HPC">GPU-HPC</a-radio-button>
            <a-radio-button value="GPU-VGA">GPU-VGA</a-radio-button>
          </a-radio-group>
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
  name: 'UpdateDeviceTypeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const curItem = this.params.data[0]

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: curItem.dev_type || 'GPU-HPC',
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
    doSubmit (data) {
      const ids = this.params.data.map((item) => item.id)
      return new this.$Manager('isolated_devices').batchUpdate({
        ids,
        data: {
          dev_type: data.type,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doSubmit(values)
        this.params.refresh()
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
<style lang="scss" scoped>
.messages-list p {
  margin-bottom: 4px;
}
</style>
