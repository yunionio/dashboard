<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">{{params.title}}</div>
        <a-form slot="body" :form="form.fc" class="mt-3">
          <template v-if="params.data && params.data.length > 0">
            <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
            <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
          </template>
          <a-form-item v-bind="formItemLayout" :label="$t('db.text_60')">
            <template v-if="params.data && params.data.length > 0">
              {{params.data[0].name}}
            </template>
            <a-input v-else :placeholder="$t('validator.dbName')" v-decorator="decorators.name" />
          </a-form-item>
          <a-form-item v-bind="formItemLayout" :label="$t('db.text_294')">
            <a-textarea :placeholder="$t('db.text_295')"
              :autosize="{ minRows: 4, maxRows: 7 }"
              v-decorator="decorators['ip_list']" />
              <div style="line-height:20px;color:#999">{{$t('db.text_296')}}<b style="color:#666">{{remainIpCount}}</b>{{$t('db.text_297')}}</div>
          </a-form-item>
        </a-form>
         <div slot="footer">
            <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
            <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
         </div>
    </base-dialog>
</template>

<script>
import validateForm, { REGEXP } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisWhiteListFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      title: this.$t('db.text_41'),
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
      ipsLength: 0,
    }
  },
  computed: {
    decorators () {
      const { initialValues = {} } = this.params
      const decorators = {
        name: [
          'name',
          {
            initialValue: initialValues.name,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('db.text_136') },
              { validator: validateForm('dbName') },
            ],
          },
        ],
        ip_list: [
          'ip_list',
          {
            initialValue: initialValues.ip_list,
            validateFirst: true,
            validateTrigger: 'blur',
            rules: [
              { required: true, message: this.$t('db.text_298') },
              { validator: this.validateIps },
            ],
          },
        ],
      }
      return decorators
    },
    remainIpCount () {
      return 20 - this.ipsLength
    },
  },
  created () {
    const { allIPList } = this.params
    this.ipsLength = allIPList.length
  },
  methods: {
    validateIps (rule, value, _callback) {
      const REG_IP = REGEXP.IPv4.regexp
      const REG_NUM = /\d/
      if (value) {
        const ips = value.split(',')
        const alreadyipList = [...this.params.allIPList]
        const itselfIpList = this.params.data ? this.params.data[0].ip_list.split(',') : []
        for (let i = 0; i < alreadyipList.length; i++) {
          for (let j = 0; j < itselfIpList.length; j++) {
            const sameIndex = alreadyipList.indexOf(itselfIpList[j])
            if (sameIndex > -1) {
              alreadyipList.splice(sameIndex, 1)
            }
          }
        }
        const ipsLength = ips.length
        if (ipsLength >= 20) {
          return _callback(this.$t('db.text_299'))
        }
        for (let i = 0; i < ipsLength; i++) {
          const _item = ips[i]
          const [_ip, _u] = _item.split('/')
          if (_ip && !REG_IP.test(_ip)) {
            return _callback(this.$t('db.text_300', [_item]))
          }
          if (_u && !REG_NUM.test(_u)) {
            return _callback(this.$t('db.text_301', [_u]))
          }
          if (ips.indexOf(_item) !== i) {
            return _callback(this.$t('db.text_302', [_item]))
          }
        }
        for (let i = 0; i < alreadyipList.length; i++) {
          for (let j = 0; j < ipsLength; j++) {
            if (alreadyipList.indexOf(ips[j]) > -1) {
              return _callback(this.$t('db.text_302', [ips[j]]))
            }
          }
        }
        this.ipsLength = ipsLength
      }
      _callback()
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
        if (this.params.data && this.params.data.length > 0) {
          const params = {
            ...values,
            elasticcache: this.params.redisItem.id,
          }
          if (params.name === this.params.data[0].name) {
            delete params.name
          }
          await this.params.list.onManager('update', {
            steadyStatus: this.params.steadyStatus,
            id: this.params.data[0].id,
            managerArgs: {
              data: params,
            },
          })
        } else {
          await this.params.list.onManager('create', {
            steadyStatus: this.params.steadyStatus,
            managerArgs: {
              data: {
                ...values,
                elasticcache: this.params.redisItem.id,
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
  },
}
</script>
