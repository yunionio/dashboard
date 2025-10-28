<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.text_113')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_492', [params.resourceType === 'server_container' ? this.$t('dictionary.server_container') : this.$t('dictionary.server')])" v-bind="formItemLayout" :extra="$t('compute.text_493')">
          <a-select v-decorator="decorators.guest">
            <a-select-option v-for="item in guestesOpts" :key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="isShowAutoStart" :label="$t('compute.text_494')" v-bind="formItemLayout" :extra="$t('compute.text_495')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoStart" />
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
  name: 'GpuAttachServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              // this.form.fd[key] = values[key]
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
      decorators: {
        guest: [
          'guest',
          {
            rules: [
              {
                required: true,
                message: this.$t('compute.text_496', [
                  this.$t('dictionary.server'),
                ]),
              },
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
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    dev_type () { // 目前支持USB和GPU卡
      const { dev_type } = this.params.data[0]
      return dev_type === 'USB' ? 'USB' : 'GPU'
    },
    columns () {
      const ret = []
      this.params.columns.map(item => {
        if (['name', 'dev_type', 'model', 'host'].indexOf(item.field) !== -1) {
          ret.push(item)
        }
      })
      return ret
    },
    curGuest () {
      return this.guestesOpts.find(o => o.id === this.form.fd.guest)
    },
    isGuestRunning () {
      return this.curGuest?.status === 'running'
    },
    isShowAutoStart () {
      return this.curGuest !== undefined && !this.isGuestRunning
    },
  },
  created () {
    const params = {
      host_id: this.params.data[0].host_id,
      filter: this.params.resourceType === 'server_container' ? 'hypervisor.in(pod)' : 'hypervisor.in(kvm)',
      scope: this.scope,
      limit: 0,
    }
    new this.$Manager('servers').list({ params })
      .then((res) => {
        this.guestesOpts = res.data.data.filter(val => this.params.resourceType === 'server_container' ? val.status === 'ready' : val.status === 'ready' || val.status === 'running')
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
          auto_start: this.isShowAutoStart ? data.autoStart : false,
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
