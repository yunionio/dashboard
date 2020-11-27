<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('storage.text_238')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('storage.text_239')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.Effect">
            <a-radio-button value="Allow">{{$t('storage.text_217')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('storage.text_240')" v-bind="formItemLayout" required>
          <a-row>
            <a-col :span="11" class="mr-1">
              <a-form-item>
                <a-select v-decorator="decorators.PrincipalType" @change="handleTypeChange">
                  <a-select-option value="root">{{$t('storage.text_241')}}</a-select-option>
                  <a-select-option value="child">{{$t('storage.text_242')}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item>
                <a-input v-decorator="decorators.PrincipalId" v-if="isRoot" />
                <base-select
                  v-else
                  v-decorator="decorators.PrincipalId"
                  class="w-100"
                  :remote="true"
                  needParams
                  resource="cloudusers"
                  version="v1"
                  idKey="external_id"
                  :params="principalParams"
                  :select-props="{ placeholder: $t('storage.text_243'), allowClear: true,  mode: 'multiple' }" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="$t('storage.text_244')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.resource" @change="handleResourceTypeChange">
            <a-radio value="entirebucket">{{$t('storage.text_245')}}</a-radio>
            <a-radio value="designatedResource">{{$t('storage.text_246')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('storage.text_247')" v-bind="formItemLayout">
          <div class="d-flex">
            <div>
              {{ params.bucketData.name }}/
            </div>
            <div class="flex-grow-1">
              <a-textarea :disabled="isEntirebucket" v-decorator="decorators.ResourcePath" :placeholder="$t('storage.text_250')" :auto-size="{ minRows: 3, maxRows: 5 }" />
            </div>
          </div>
        </a-form-item>
        <a-form-item :label="$t('storage.text_251')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.CannedAction">
            <a-radio-button value="Read">{{$t('storage.text_252')}}</a-radio-button>
            <a-radio-button value="ReadWrite">{{$t('storage.text_253')}}</a-radio-button>
            <a-radio-button value="FullControl">{{$t('storage.text_254')}}</a-radio-button>
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CreatePolicyDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      type: 'root',
      resourceType: 'entirebucket',
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        Effect: [
          'Effect',
          {
            initialValue: 'Allow',
          },
        ],
        PrincipalType: [
          'PrincipalType',
          {
            initialValue: 'root',
          },
        ],
        PrincipalId: [
          'PrincipalId',
          {
            rules: [
              { required: true, message: this.$t('storage.text_255') },
            ],
          },
        ],
        resource: [
          'resource',
          {
            initialValue: 'entirebucket',
          },
        ],
        ResourcePath: [
          'ResourcePath',
          {
            initialValue: '*',
            rules: [
              { required: true, message: this.$t('storage.text_256') },
            ],
          },
        ],
        CannedAction: [
          'CannedAction',
          {
            initialValue: 'Read',
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
      principalParams: {
        scope: this.$store.getters.scope,
        show_fail_reason: true,
        details: true,
        cloudaccount: this.params.bucketData.account_id,
        limit: 20,
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    isRoot () {
      return this.type === 'root'
    },
    isEntirebucket () {
      return this.resourceType === 'entirebucket'
    },
  },
  methods: {
    handleTypeChange (value) {
      this.type = value
      this.form.fc.resetFields(['PrincipalId'])
    },
    handleResourceTypeChange (e) {
      if (e.target.value === 'entirebucket') {
        this.form.fc.setFieldsValue({ ResourcePath: '*' })
      } else {
        this.form.fc.setFieldsValue({ ResourcePath: '' })
      }
      this.resourceType = e.target.value
    },
    genData (data) {
      const { Effect, CannedAction } = data
      const ret = {
        Effect,
        CannedAction,
      }
      if (data.PrincipalType === 'child') {
        ret.PrincipalId = data.PrincipalId.map(item => {
          return ':' + item
        })
      } else {
        ret.PrincipalId = data.PrincipalId + ':'
      }
      ret.ResourcePath = data.ResourcePath.trim().split('\n')
      ret.ResourcePath = ret.ResourcePath.map(item => '/' + item)
      return ret
    },
    doCreate (data) {
      return new this.$Manager('buckets').performAction({
        id: this.params.bucketID,
        action: 'set-policy',
        data: data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = this.genData(values)
        await this.doCreate(data)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
