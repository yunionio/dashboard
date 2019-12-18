<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更新账号密码</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="更新账号密码" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <a-form-item label="AppID" v-if="isQcloud">
          <a-input v-decorator="decorators.app_id" placeholder="请输入App ID" />
          <div slot="extra" class="text-right">
            <help-link :href="doc">如何获取腾讯云的 App ID 和密钥？</help-link>
          </div>
        </a-form-item>
        <a-form-item label="租户（Tenant） ID" v-if="isAzure">
          <a-input v-decorator="decorators.directory_id" placeholder="请输入租户（Tenant）ID" />
          <div slot="extra" class="text-right">
            <help-link :href="doc">如何获取Azure的租户（Tenant） ID ？</help-link>
          </div>
        </a-form-item>
        <a-form-item :label="field.label.k">
          <a-textarea v-if="isGoogle" :autosize="{ minRows: 3, maxRows: 7 }" v-decorator="decorators.keyId" :placeholder="field.placeholder.k" />
          <a-input v-else v-decorator="decorators.keyId" :placeholder="field.placeholder.k" />
          <div slot="extra" class="text-right" v-if="!isGoogle">
            <help-link :href="doc">如何获取{{ field.text }} {{ field.label.k }} 和 {{ field.label.s }}？</help-link>
          </div>
        </a-form-item>
        <a-form-item :label="field.label.s">
          <a-input v-decorator="decorators.keySecret" :placeholder="field.placeholder.s" type="password" />
        </a-form-item>
        <a-form-item label="账单密钥" v-if="isAzure">
          <a-textarea v-decorator="decorators.balanceKey" rows="4" />
        </a-form-item>
        <a-form-item label="项目" v-if="isOpenStack">
          <a-input v-decorator="decorators.project_name" placeholder="请输入OpenStack的项目，如：admin" />
        </a-form-item>
        <a-form-item label="端点类型" v-if="isOpenStack">
          <a-select v-decorator="decorators.endpoint_type" placeholder="请选择端点类型">
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
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { keySecretFields, CLOUDACCOUNT_DOCS } from '../constants'
import { HYPERVISORS_MAP } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudaccountUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const provider = this.params.data[0].brand.toLowerCase()
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
            rules: [
              { required: true, message: '请输入密钥ID' },
            ],
          },
        ],
        keySecret: [
          keySecretFields[provider].s,
          {
            rules: [
              { required: true, message: '请输入密码' },
            ],
          },
        ],
        directory_id: [
          'directory_id',
          {
            rules: [
              { required: true, message: '请输入租户（Tenant）ID' },
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
              { required: true, message: '请输入APP ID' },
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
              { required: true, message: 'openstack 项目不能为空' },
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
        const params = {
          ...values,
          id: this.params.data[0].id,
        }
        await this.params.list.singlePerformAction('update-credential', params)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
