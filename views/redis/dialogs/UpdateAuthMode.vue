<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <div class="mb-3">
        <a-alert :showIcon="false" :message="alertMsg" banner />
      </div>
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <!-- <a-form :form="form.fc">
        <a-form-item :label="$t('db.text_54')" v-bind="formItemLayout">
          <a-radio-group v-decorator="['duration', {initialValue: (params.data && params.data.length > 0) ? (params.data[0].duration || '1M') : '1M' }]">
              <a-radio-button
                :key="item.value"
                :value="item.value"
                v-for="item in BUY_DURATIONS_OPTIONS">
                {{item.label}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form> -->
    </div>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { BUY_DURATIONS_OPTIONS } from '../constants/index.js'
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisUpdateAuthModeDialog',
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      BUY_DURATIONS_OPTIONS,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      decorators: {
        boot_order: [
          'boot_order',
          {
            rules: [
              { required: true, message: this.$t('db.text_148') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    alertMsg () {
      const data = this.params.data[0]
      if (data.auth_mode !== 'on') {
        return this.$t('db.text_292')
      } else {
        return this.$t('db.text_293')
      }
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.params.onManager('performAction', {
          steadyStatus: 'running',
          id: this.params.data[0].id,
          managerArgs: {
            action: '/update-auth-mode',
            data: {
              auth_mode: this.params.data[0].auth_mode === 'on' ? 'off' : 'on',
            },
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
