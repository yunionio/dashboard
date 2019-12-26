<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">关联主机</div>
    <div slot="body">
      <dialog-selected-tips name="GPU" :count="params.data.length" action="关联主机" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="选择主机" v-bind="formItemLayout">
          <a-select v-decorator="decorators.guest">
            <a-select-option v-for="item in guestesOpts" :key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
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
  name: 'AttachGpuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        guest: [
          'guest',
          {
            rules: [
              { required: true, message: '请选择关联主机' },
            ],
          },
        ],
      },
      guestesOpts: [],
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
  created () {
    let params = {
      host: this.params.data[0].host_id,
      hypervisor: 'kvm',
      scope: this.scope,
      limit: 0,
    }
    new this.$Manager('servers').list({ params })
      .then((res) => {
        this.guestesOpts = res.data.data.filter(val => val.status === 'ready')
      })
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
    doAttach (data) {
      return new this.$Manager('servers').performAction({
        id: data.guest,
        action: 'attach-isolated-device',
        data: {
          auto_start: true,
          device: this.params.data[0].id,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doAttach(values)
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
