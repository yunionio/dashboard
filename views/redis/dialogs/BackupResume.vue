<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">{{title}}</div>
        <div slot="body">
          <dialog-selected-tips :count="params.data.length" :action="title" />
          <vxe-grid class="mb-2" :data="params.data" :columns="columns" />
        </div>
         <div slot="footer">
            <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
            <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
         </div>
    </base-dialog>
</template>

<script>
import { ACCOUNT_PRIVILEGES } from '../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
// import validateForm from '@/utils/validate'

export default {
  name: 'RedisBackupResumeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      title: '恢复',
      loading: false,
      privileges: ACCOUNT_PRIVILEGES,
      form: {
        fc: this.$form.createForm(this),
      },
      columns: [
        {
          field: 'name',
          title: '名称',
        },
      ],
    }
  },
  methods: {
    rulesCheckPassword (rule, value, callback) {
      const form = this.form.fc
      if (value && value !== form.getFieldValue('password')) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const params = {
          ...values,
          elasticcache: this.params.redisItem.id,
        }
        delete params.checkPassword
        await this.params.list.onManager('batchPost', {
          managerArgs: {
            data: params,
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
