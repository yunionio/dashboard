<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_340')}}</div>
    <div slot="body">
      <a-alert class="mb-3" type="warning">
        <template slot="message">
          <div>
            {{$t('cloudenv.text_341')}}
          </div>
          <div>{{$t('cloudenv.text_342')}} </div>
          <!-- <div>2.录入的APP必须被授予Owner的权限，操作步骤请点击查看帮助  <help-link href="/">详情</help-link></div> -->
          <div>{{$t('cloudenv.text_343')}}</div>
        </template>
      </a-alert>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('cloudenv.text_344')">
          <base-select
            showSync
            isDefaultSelect
            :resource="`cloudaccounts/${params.data.id}/enrollment-accounts`"
            v-decorator="decorators.enrollmentAccountId"
            :selectProps="{ 'placeholder': $t('cloudenv.text_345') }" />
            <div slot="extra">{{$t('cloudenv.text_346')}}</div>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_347')">
          <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_348')" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_349')">
          <a-select v-decorator="decorators.offerType" :placeholder="$t('cloudenv.text_350')">
            <a-select-option value="MS-AZR-0017P">{{$t('cloudenv.text_351')}}</a-select-option>
            <a-select-option value="MS-AZR-0148P">{{$t('cloudenv.text_352')}}</a-select-option>
          </a-select>
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
  name: 'cloudproviderCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
            ],
          },
        ],
        enrollmentAccountId: [
          'enrollment_account_id',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_345') },
            ],
          },
        ],
        offerType: [
          'offer_type',
          {
            initialValue: 'MS-AZR-0017P',
            rules: [
              { required: true, message: this.$t('cloudenv.text_350') },
            ],
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
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await new this.$Manager('cloudaccounts').performAction({
          id: this.params.data.id,
          action: 'create-subscription',
          data: values,
        })
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
