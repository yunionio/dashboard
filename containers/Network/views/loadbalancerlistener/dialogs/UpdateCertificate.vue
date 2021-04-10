<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_366')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.lb_listener')" :count="params.data.length" :action="$t('network.text_470')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('network.text_471')">
          <base-select
            v-decorator="decorators.certificate"
            resource="loadbalancercertificates"
            :params="certificateParams"
            show-sync
            :select-props="{ placeholder: $t('network.text_421') }" />
          <div slot="extra">{{$t('network.text_422')}}<help-link href="/lbcert">{{$t('network.text_321')}}</help-link></div>
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
              { required: true, message: this.$t('network.text_421') },
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
        limit: 0,
        cloudregion: lbDetail.cloudregion_id,
        manager: lbDetail.manager_id,
      }
      const projectDomain = this.params.data[0].project_domain
      if (this.$store.getters.isAdminMode) {
        params.project_domain = projectDomain
      } else {
        params.scope = this.$store.getters.scope
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
