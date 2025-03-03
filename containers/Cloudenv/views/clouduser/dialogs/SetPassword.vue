<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_529')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.coludgroup_text001')" :count="params.data.length" :action="$t('cloudenv.text_529')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('cloudenv.clouduser_list_t2')" prop="password">
          <a-input-password v-model="fd.password" :placeholder="$t('validator.password')" />
        </a-form-model-item>
      </a-form-model>
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
import { REGEXP } from '@/utils/validate'

export default {
  name: 'ClouduserSetPasswordDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      fd: {
        password: '',
      },
      rules: {
        password: [
          {
            required: true,
            validator: (rule, value, cb) => {
              if (!this.fd.password) {
                cb()
              } else {
                const { regexp, message } = REGEXP.password
                if (regexp.test(this.fd.password)) {
                  cb()
                } else {
                  cb(Error(message))
                }
              }
            },
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
  created () {
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'reset-password',
            data: {
              password: this.fd.password,
            },
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
