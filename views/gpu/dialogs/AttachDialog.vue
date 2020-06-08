<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.gpu')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="`选择${this.$t('dictionary.server')}`" v-bind="formItemLayout" extra="只能选择与GPU卡同一宿主机处于关机状态的虚拟机">
          <a-select v-decorator="decorators.guest">
            <a-select-option v-for="item in guestesOpts" :key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="自动启动" v-bind="formItemLayout" extra="设置成功后是否自动启动">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.autoStart" />
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
              { required: true, message: `请选择关联${this.$t('dictionary.server')}` },
            ],
          },
        ],
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: true,
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
    const params = {
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
          auto_start: data.autoStart,
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
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
