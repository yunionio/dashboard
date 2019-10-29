<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">修改权限</div>
        <div slot="body">
           <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
           <a-form :form="form.fc" class="mt-3">
              <a-form-item label="权限设置">
                <a-radio-group v-decorator="decorators.account_privilege">
                    <a-radio v-for="k in Object.keys(privileges)" :key="k" :value="k">
                      {{privileges[k]}}
                    </a-radio>
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
import { ACCOUNT_PRIVILEGES } from '../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisAccountListSetPrivilegeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      privileges: ACCOUNT_PRIVILEGES,
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  computed: {
    decorators () {
      const { initialValues = {} } = this.params
      const decorators = {
        account_privilege: [
          'account_privilege',
          {
            initialValue: initialValues['account_privilege'],
          },
        ],
      }
      return decorators
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const params = {
          account_privilege: this.form.fc.getFieldValue('account_privilege'),
          elasticcache: this.params.redisItem.id,
        }
        await this.params.list.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'reset-password',
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
