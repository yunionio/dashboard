<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="共享类型" v-bind="formItemLayout" :extra="extra">
          <a-radio-group v-decorator="decorators.share_mode" @change="shareModeHandle">
            <a-radio-button v-for="v in shareTypes" :key="v.key" :value="v.key">{{v.value}}</a-radio-button>
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
  name: 'CloudaccountSetShareDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.data[0]
    return {
      loading: false,
      action: '设置共享',
      l3PermissionEnable: this.$store.getters.l3PermissionEnable,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          share_mode: data.share_mode,
        },
      },
      decorators: {
        share_mode: [
          'share_mode',
          {
            initialValue: data.share_mode,
          },
        ],
      },
      shareTypes: [
        { key: 'account_domain', value: '私有' },
        { key: 'system', value: '共享云账号' },
        { key: 'provider_domain', value: '共享订阅' },
      ],
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
  computed: {
    extra () {
      const shareModeExtra = {
        'account_domain': `私有：只有所属${this.$t('dictionary.domain')}下的任意${this.$t('dictionary.project')}可以使用该云账号下的任意订阅创建资源`,
        'system': `共享云账号：所有${this.$t('dictionary.domain')}下的任意${this.$t('dictionary.project')}可以使用该云账号下的任意订阅创建资源`,
        'provider_domain': `共享订阅：指定${this.$t('dictionary.domain')}下的任意${this.$t('dictionary.project')}可以使用该云账号下的指定订阅，该类型设置完成后，还需要单独在订阅列表进行 【更改${this.$t('dictionary.project')}】 设置才可生效`,
      }
      return shareModeExtra[this.form.fd.share_mode]
    },
  },
  methods: {
    async doSetShareSubmit (data) {
      const id = this.params.data[0].id
      return this.params.onManager('performAction', {
        id,
        managerArgs: {
          action: 'share-mode',
          data: {
            share_mode: data.share_mode,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.getFieldsValue()
        await this.doSetShareSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    shareModeHandle (e) {
      this.form.fd.share_mode = e.target.value
    },
  },
}
</script>
