<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_298')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.cloudaccount')" :count="params.data.length" :action="$t('cloudenv.text_298')" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <a-form-item label="AppID" v-if="isQcloud">
          <a-input v-decorator="decorators.app_id" :placeholder="$t('cloudenv.text_260')" />
          <div slot="extra">
            <help-link :href="doc">{{$t('cloudenv.text_299')}}</help-link>
          </div>
        </a-form-item>
        <upload-json-file :fc="form.fc" v-if="isGoogle">
          <a-form-item :label="field.label.k">
            <a-textarea :autosize="{ minRows: 3, maxRows: 7 }" v-decorator="decorators.keyId" :placeholder="field.placeholder.k" />
          </a-form-item>
          <a-form-item :label="field.label.s">
            <a-input-password v-decorator="decorators.keySecret" :placeholder="field.placeholder.s" type="password" />
          </a-form-item>
        </upload-json-file>
        <div v-else>
          <a-form-item :label="field.label.k">
            <a-input v-decorator="decorators.keyId" :disabled="isVMware" :placeholder="field.placeholder.k" />
            <div slot="extra" class="d-flex">
              <span v-if="isVMware">{{$t('cloudenv.text_302')}}</span>
              <div class="flex-grow-1">
                <help-link :href="doc">{{$t('cloudenv.text_303', [ field.text , field.label.k , field.label.s ])}}</help-link>
              </div>
            </div>
          </a-form-item>
          <a-form-item :label="$t('cloudenv.text_300')" v-if="isAzure">
            <a-input v-decorator="decorators.directory_id" :placeholder="$t('cloudenv.text_243')" />
            <div slot="extra">
              <help-link :href="doc">{{$t('cloudenv.text_301')}}</help-link>
            </div>
          </a-form-item>
          <a-form-item :label="field.label.s">
            <a-input-password v-decorator="decorators.keySecret" :placeholder="field.placeholder.s" type="password" />
          </a-form-item>
         </div>
        <!-- <a-form-item :label="$t('cloudenv.text_242')" v-if="isAzure">
          <a-textarea v-decorator="decorators.balanceKey" rows="4" />
        </a-form-item> -->
        <a-form-item :label="$t('cloudenv.text_254')" v-if="isOpenStack">
          <a-input v-decorator="decorators.project_name" :placeholder="$t('cloudenv.text_255')" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_304')" v-if="isOpenStack">
          <a-select v-decorator="decorators.endpoint_type" :placeholder="$t('cloudenv.text_305')">
            <a-select-option
              v-for="item in endpointTypeOpts"
              :key="item.key"
              :value="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <test-button :post="testPost" />
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { keySecretFields, CLOUDACCOUNT_DOCS } from '../constants'
import UploadJsonFile from '@Cloudenv/views/cloudaccount/components/UploadJsonFile'
import TestButton from '@/sections/TestButton'
import { HYPERVISORS_MAP } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudaccountUpdateDialog',
  components: { UploadJsonFile, TestButton },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const provider = this.params.data[0].brand.toLowerCase()
    const isVMware = provider === HYPERVISORS_MAP.esxi.provider.toLowerCase()
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      provider,
      decorators: {
        keyId: [
          keySecretFields[provider].k,
          {
            initialValue: isVMware ? this.params.data[0].account : undefined,
            rules: [
              { required: true, message: this.$t('cloudenv.text_306') },
            ],
          },
        ],
        keySecret: [
          keySecretFields[provider].s,
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_150') },
            ],
          },
        ],
        directory_id: [
          'directory_id',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_243') },
            ],
          },
        ],
        balanceKey: [
          'balanceKey',
        ],
        app_id: [
          'app_id',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_307') },
            ],
          },
        ],
        endpoint_type: [
          'endpoint_type',
        ],
        project_name: [
          'project_name',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_308') },
            ],
          },
        ],
      },
      endpointTypeOpts: [
        { key: 'internal', label: 'internal' },
        { key: 'admin', label: 'admin' },
        { key: 'public', label: 'public' },
      ],
    }
  },
  computed: {
    field () {
      return keySecretFields[this.provider]
    },
    doc () {
      return CLOUDACCOUNT_DOCS[this.provider]
    },
    isQcloud () {
      return this.provider === HYPERVISORS_MAP.qcloud.key
    },
    isAzure () {
      return this.provider === HYPERVISORS_MAP.azure.key
    },
    isOpenStack () {
      return this.provider === HYPERVISORS_MAP.openstack.key
    },
    isGoogle () {
      return this.provider === HYPERVISORS_MAP.google.key
    },
    isVMware () {
      return this.provider === HYPERVISORS_MAP.esxi.provider.toLowerCase()
    },
    formItemLayout () {
      const ret = {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      }
      if (this.isAzure || this.isGoogle) {
        ret.wrapperCol.span = 19
        ret.labelCol.span = 5
      }
      return ret
    },
    offsetFormLayout () {
      const ret = {
        wrapperCol: {
          span: 21,
          offset: 3,
        },
      }
      if (this.isAzure || this.isGoogle) {
        ret.wrapperCol.span = 19
        ret.wrapperCol.offset = 5
      }
      return ret
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) {
            reject(err)
          } else {
            const params = {}
            R.forEachObjIndexed((value, key) => {
              if (R.is(String, value)) {
                params[key] = value.trim()
              } else {
                params[key] = value
              }
            }, values)
            resolve(params)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const params = values
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'update-credential',
            data: params,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    async testPost () {
      const values = await this.validateForm()
      await this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'test-connectivity',
          data: values,
        },
      })
    },
  },
}
</script>
