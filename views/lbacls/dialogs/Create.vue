<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="策略组名称" v-bind="formItemLayout" v-if="params.type === 'create'">
          <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，不含'.','_','@'" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">批量添加地址
            <a-tooltip>
              <div slot="title">
                每个条目一行，以回车分隔<br />
                每个条目的地址/地址段和备注以|分隔，如“192.168.1.0/24|备注”<br />
                地址例如：192.168.1.1|备注<br />
                地址段例如：192.168.1.1/24|备注<br />
                备注为可选，限制16个字符以内
              </div>
              <a-icon type="info-circle" />
            </a-tooltip>
          </span>
          <a-textarea v-decorator="decorators.acl_entries"
            placeholder="每个条目一行，以回车分隔
每个条目的地址/地址段和备注以|分隔，如“192.168.1.0/24|备注”
地址例如：192.168.1.1|备注
地址段例如：192.168.1.1/24|备注
备注为可选，限制16个字符以内"
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
      let [ipStr] = ip.split('/')
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
      cb(new Error('请输入不同的IP'))
    } else {
      if (!descValid) cb(new Error('请输入16字符以内的备注'))
      cb()
    }
  } else {
    cb(new Error('请输入合法的IP'))
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
              { required: true, message: '请输入名称' },
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
              { required: true, message: '批量添加地址不能为空' },
              { validator: ipsValidate },
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
