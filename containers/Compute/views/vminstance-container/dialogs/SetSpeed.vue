<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item v-for="(obj, idx) in disksInfo" :key="idx">
          <a-card size="small">
            <div slot="title"><a-tag>{{ obj.disk_type === 'sys' ? $t('common_432') : $t('common_433') }}</a-tag> {{obj.name}}</div>
            <a-row>
              <a-col :span="12">
                <a-form-item v-bind="formItemLayout" :extra="$t('compute.not_limited')">
                  <span slot="label">
                    {{ $t('compute.iops') }}&nbsp;
                    <a-tooltip :title="$t('compute.text_1248_tip')">
                      <a-icon type="question-circle-o" />
                    </a-tooltip>
                  </span>
                  <span>
                    <a-input-number :min="0" :step="50" v-decorator="decorators.iops(idx)" />
                  </span>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item v-bind="formItemLayout" :extra="$t('compute.not_limited')">
                  <span slot="label">
                    {{ $t('compute.bps') }}&nbsp;
                    <a-tooltip :title="$t('compute.text_1248_1_tip')">
                      <a-icon type="question-circle-o" />
                    </a-tooltip>
                  </span>
                  <span>
                    <a-input-number :min="0" :step="50" v-decorator="decorators.bps(idx)" />
                  </span>
                  <span class="ml-2">M/s</span>
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
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
  name: 'VmSetSpeedDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_1249'),
      form: {
        fc: this.$form.createForm(this),
        fi: {},
      },
      decorators: {
        iops: i => [
          `iops${i}`,
          {
            initialValue: 0,
            rules: [
              { required: true, message: this.$t('compute.text_1250') },
            ],
          },
        ],
        bps: i => [
          `bps${i}`,
          {
            initialValue: 0,
            rules: [
              { required: true, message: this.$t('compute.text_1250_1') },
            ],
          },
        ],
        unit: [
          'unit',
          {
            initialValue: 'M',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 12,
        },
        labelCol: {
          span: 8,
        },
      },
    }
  },
  computed: {
    disksInfo () {
      return this.params.data[0].disks_info
    },
  },
  created () {
    this.initialValue()
  },
  methods: {
    initialValue () {
      this.$nextTick(() => {
        this.disksInfo.forEach((o, i) => {
          this.form.fc.setFieldsValue({
            [`iops${i}`]: o.iops,
            [`bps${i}`]: o.bps / 1024 / 1024,
          })
        })
      })
    },
    async doSetSpeedSubmit (values) {
      const bps = {}
      const iops = {}
      this.disksInfo.forEach((o, i) => {
        bps[o.id] = +(values[`bps${i}`]) * 1024 * 1024
        iops[o.id] = values[`iops${i}`]
      })
      const params = {
        bps,
        iops,
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'io-throttle',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doSetSpeedSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
