<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_291')" v-bind="formItemLayout" v-if="params.type === 'create'">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">{{$t('network.text_292')}}<a-tooltip>
              <div slot="title">{{$t('network.text_293')}}<br />{{$t('network.text_294')}}<br />{{$t('network.text_295')}}<br />{{$t('network.text_296')}}<br />{{$t('network.text_297')}}</div>
              <a-icon type="info-circle" />
            </a-tooltip>
          </span>
          <a-textarea v-decorator="decorators.acl_entries"
            :placeholder="$t('network.text_298')"
            rows="8" />
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
import { REGEXP } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

const ipsValidate = (rule, value, cb) => {
  const pureIps = value.split(/[\s\n]/).filter(v => !!v).map(str => str.trim())
  const noRepeatIps = Array.from(new Set(pureIps))
  const isRepeat = noRepeatIps.length !== pureIps.length
  let descValid = true
  const valid = pureIps.every(ipComment => {
    const [ip, comment = ''] = ipComment.split('|').filter(v => !!v && v !== '|')
    if (comment.length > 16) descValid = false
    if (ip.includes('/')) {
      const [ipStr] = ip.split('/')
      if (REGEXP.IPv4.regexp.test(ipStr) && REGEXP.cidr.regexp.test(ip)) {
        return true
      } else {
        return false
      }
    } else {
      if (REGEXP.IPv4.regexp.test(ip)) {
        return true
      }
      return false
    }
  })
  if (valid) {
    if (isRepeat) {
      cb(new Error(this.$t('network.text_299')))
    } else {
      if (!descValid) cb(new Error(this.$t('network.text_300')))
      cb()
    }
  } else {
    cb(new Error(this.$t('network.text_301')))
  }
}

export default {
  name: 'LbaclsCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.acl_entries) {
              const str = values.acl_entries
              const cidrs = str.split(/[\s\n]/).filter(v => !!v)
              this.aclEntries = cidrs.map(str => {
                const [cidr, comment = ''] = str.split('|')
                return {
                  cidr,
                  comment,
                }
              })
            }
          },
        }),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('serverName') },
            ],
          },
        ],
        acl_entries: [
          'acl_entries',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_302') },
              { validator: ipsValidate },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      aclEntries: [],
    }
  },
  created () {
    if (this.params.type === 'update') {
      const initialValue = this.params.data[0].acl_entries.map(v => {
        if (v.comment) {
          return `${v.cidr}|${v.comment}`
        }
        return v.cidr
      }).join(`
`)
      this.form.fc.getFieldDecorator('acl_entries', { preserve: true, initialValue })
    }
  },
  methods: {
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data: {
            name: data.name,
            acl_entries: this.aclEntries,
          },
        },
      })
    },
    doUpdate (data) {
      return this.params.onManager('update', {
        id: this.params.data[0].id,
        managerArgs: {
          data: {
            name: data.name,
            acl_entries: this.aclEntries,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.params.type === 'create') {
          await this.doCreate(values)
        } else {
          await this.doUpdate(values)
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
