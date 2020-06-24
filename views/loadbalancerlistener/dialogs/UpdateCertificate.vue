<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更换证书</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.lb_listener')" :count="params.data.length" action="调整访问控制" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="新证书">
          <base-select
            v-decorator="decorators.certificate"
            resource="loadbalancercertificates"
            :params="certificateParams"
            show-sync
            :select-props="{ placeholder: '请选择证书' }" />
          <div slot="extra">没有想要的？可以前往<help-link href="/lbcert"> 新建证书</help-link></div>
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
  name: 'LbListenerUpdateCertificate',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        certificate: [
          'certificate',
          {
            initialValue: this.params.lbDetail.id,
            rules: [
              { required: true, message: '请选择证书' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    certificateParams () {
      const { lbDetail } = this.params
      const params = {
        usable: true,
        scope: this.$store.getters.scope,
        limit: 0,
        cloudregion: lbDetail.cloudregion_id,
        manager: lbDetail.manager_id,
      }
      return params
    },
  },
  methods: {
    doCreate (data) {
      if (this.params.data.length === 1) {
        return this.params.onManager('update', {
          id: this.params.data[0].id,
          managerArgs: {
            data,
          },
        })
      } else {
        return this.params.onManager('batchUpdate', {
          ids: this.params.data.map(item => item.id),
          managerArgs: {
            data,
          },
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.params.refresh()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
