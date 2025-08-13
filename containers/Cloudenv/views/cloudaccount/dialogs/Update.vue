<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_298')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.cloudaccount')" :count="params.data.length" :action="$t('cloudenv.text_298')" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <upload-json-file :fc="form.fc" v-if="isGoogle">
          <a-form-item :label="field.label.k">
            <a-textarea :autosize="{ minRows: 3, maxRows: 7 }" v-decorator="decorators.keyId" :placeholder="field.placeholder.k" />
          </a-form-item>
          <a-form-item :label="field.label.s">
            <a-input-password v-decorator="decorators.keySecret" :placeholder="field.placeholder.s" type="password" />
          </a-form-item>
        </upload-json-file>
        <div v-else>
          <h2 class="mt-3 mb-3" v-if="isHcs">{{ $t('cloudenv.operation_info_input') }}</h2>
          <a-form-item :label="field.label.k">
            <a-input v-decorator="decorators.keyId" :placeholder="field.placeholder.k" />
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
          <!-- <template v-if="isVMware">
            <a-form-item :label="$t('cloudenv.text_264')" :extra="this.$t('common_572')">
              <a-input v-decorator="decorators.host" />
            </a-form-item>
            <a-form-item :label="$t('cloudenv.text_266')">
              <a-input v-decorator="decorators.port" />
            </a-form-item>
          </template> -->
         </div>
        <!-- <a-form-item :label="$t('cloudenv.text_242')" v-if="isAzure">
          <a-textarea v-decorator="decorators.balanceKey" rows="4" />
        </a-form-item> -->
        <a-form-item label="project_id" v-if="isUcloud">
          <a-input v-decorator="decorators.ucloud_project_id" :placeholder="$t('cloudenv.text_247')" />
        </a-form-item>
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
        <template v-if="isHcs">
          <h2 class="mb-3">{{ $t('cloudenv.operation_and_maintenance_info_input') }}</h2>
          <a-form-item :label="$t('cloudenv.text_94')">
            <a-input v-decorator="decorators.options.account" :placeholder="$t('common.tips.input', [$t('cloudenv.text_94')])" />
          </a-form-item>
          <a-form-item :label="$t('cloudenv.text_147')">
            <a-input-password v-decorator="decorators.options.password" :placeholder="$t('common.tips.input', [$t('cloudenv.text_147')])" />
          </a-form-item>
        </template>
        <upload-pem-file :fc="form.fc" :decorators="decorators" v-if="isOraclecloud">
          <a-textarea
            v-decorator="decorators.oracle_private_key"
            :placeholder="$t('common.tips.input', [$t('cloudenv.private_key')])"
            :auto-size="{ minRows: 6, maxRows: 8 }" />
        </upload-pem-file>
        <template v-if="isCephFS">
          <a-form-item label="Name">
            <a-input v-decorator="decorators.option_name" />
          </a-form-item>
          <a-form-item label="Mon Host" :extra="$t('cloudenv.mon_host_extra')">
            <a-input v-decorator="decorators.mon_host" />
          </a-form-item>
          <a-form-item label="Secret">
            <a-input-password v-decorator="decorators.secret" />
          </a-form-item>
        </template>
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
import UploadJsonFile from '@Cloudenv/views/cloudaccount/components/UploadJsonFile'
import UploadPemFile from '@Cloudenv/views/cloudaccount/components/UploadPemFile'
import TestButton from '@/sections/TestButton'
import { HYPERVISORS_MAP, EXTRA_HYPERVISORS } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import regexp from '@/utils/regexp'
import { keySecretFields, getCloudaccountDocs } from '../constants'

export default {
  name: 'CloudaccountUpdateDialog',
  components: { UploadJsonFile, TestButton, UploadPemFile },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const provider = this.params.data[0].brand.toLowerCase()
    // const isVMware = provider === HYPERVISORS_MAP.esxi.provider.toLowerCase()
    const { options = {} } = this.params.data[0]
    const initMonHost = options.mon_host || ''
    const initName = options.name || ''
    const field = keySecretFields[provider] || {}
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      provider,
      decorators: {
        oracle_private_key: [
          'oracle_private_key',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.private_key')]) },
            ],
          },
        ],
        oracle_private_pem: [
          'oracle_private_pem',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.private_pem_message') },
            ],
          },
        ],
        keyId: [
          keySecretFields[provider].k,
          {
            initialValue: undefined,
            rules: [
              { required: true, message: field.placeholder?.k || this.$t('cloudenv.text_149') },
            ],
          },
        ],
        keySecret: [
          keySecretFields[provider].s,
          {
            rules: [
              { required: true, message: field.placeholder?.s || this.$t('cloudenv.text_150') },
            ],
          },
        ],
        ucloud_project_id: [
          'ucloud_project_id',
          {
            rules: [
              { required: false },
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
        host: [
          'host',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_268') },
              { validator: this.$validate(['domain', 'IPv4'], true, 'some'), trigger: ['blur', 'change'], message: this.$t('cloudenv.text_269') },
            ],
          },
        ],
        port: [
          'port',
          {
            rules: [
              { type: 'number', min: 0, max: 65535, message: this.$t('cloudenv.text_270'), trigger: 'blur', transform: (v) => parseFloat(v) },
            ],
          },
        ],
        options: {
          account: ['options.account'],
          password: ['options.password'],
        },
        option_name: [
          'option_name',
          {
            initialValue: initName,
          },
        ],
        mon_host: [
          'mon_host',
          {
            initialValue: initMonHost,
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (!value) callback()
                  const list = value.split(',')
                  if (list.every(str => {
                    return regexp.isIPv4AndPort(str)
                  })) {
                    callback()
                  }
                  callback(new Error(this.$t('cloudenv.check_mon_host')))
                },
              },
            ],
          },
        ],
        secret: [
          'secret',
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
      return getCloudaccountDocs(this.$store.getters.scope)[this.provider]
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
    isUcloud () {
      return this.provider === HYPERVISORS_MAP.ucloud.key
    },
    isGoogle () {
      return this.provider === HYPERVISORS_MAP.google.key
    },
    isVMware () {
      return this.provider === HYPERVISORS_MAP.esxi.provider.toLowerCase()
    },
    isHcs () {
      return this.provider === HYPERVISORS_MAP.hcs.key
    },
    isCephFS () {
      return this.provider === EXTRA_HYPERVISORS.CephFS.key.toLowerCase()
    },
    isOraclecloud () {
      return this.provider === HYPERVISORS_MAP.oracle.provider.toLowerCase()
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
  created () {
    this.init()
  },
  methods: {
    init () {
      if (this.isVMware) {
        const { hostname, port, protocol } = this.parseUrl(this.params.data[0].access_url)
        this.setHost(hostname)
        this.setPort(port || (protocol === 'http' ? 80 : 443))
      }
    },
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
            // 针对oracle cloud oracle_private_pem参数做转换处理
            if (params.oracle_private_pem) {
              params.oracle_private_key = params.oracle_private_pem
              delete params.oracle_private_pem
            }
            if (this.isCephFS) {
              params.options = params.options || {}
              params.options.mon_host = params.mon_host
              params.options.password = params.secret
              params.options.name = params.option_name
              delete params.mon_host
              delete params.secret
              delete params.option_name
            }
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
        if (params.ucloud_project_id && params.access_key_id) {
          params.access_key_id = params.access_key_id + '::' + params.ucloud_project_id
          delete params.ucloud_project_id
        }
        let options
        if (params.options) {
          options = params.options
          delete params.options
        }
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'update-credential',
            data: params,
          },
        })
        if (options) {
          await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data: {
                options,
              },
            },
          })
        }
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
    parseUrl (url) {
      return new URL(url)
    },
    setHost (host) {
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ host })
      })
    },
    setPort (port) {
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ port })
      })
    },
  },
}
</script>
