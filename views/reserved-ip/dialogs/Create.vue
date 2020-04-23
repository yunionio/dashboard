<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="指定IP子网" v-bind="formItemLayout">
          <base-select
            :remote="true"
            needParams
            v-decorator="decorators.network"
            resource="networks"
            :params="networkParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ placeholder: '请选择IP子网' }" />
        </a-form-item>
        <a-form-item label="IP地址" v-bind="formItemLayout">
          <ip-address
            :decorators="decorators" />
        </a-form-item>
        <a-form-item label="预留原因" v-bind="formItemLayout">
          <a-textarea
            placeholder="请填写预留原因"
            v-decorator="decorators.notes"
            :autosize="{ minRows: 2, maxRows: 6 }" />
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
import IpAddress from '../components/IpAddress'
import { validate } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ReservedIpCreateDialog',
  components: {
    IpAddress,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        network: [
          'network',
          {
            rules: [
              { required: true, message: '请选择IP子网' },
            ],
          },
        ],
        networkConfig: {
          ips: (i, networkData) => [
            `networkIps[${i}]`,
            {
              validateFirst: true,
              validateTrigger: ['change'],
              rules: [{
                required: true,
                message: '请输入IP地址',
              }, {
                validator: this.IPValidator,
              }, {
                validator: this.checkIp(i),
              }],
            },
          ],
        },
        notes: [
          'notes',
          {
            rules: [
              { required: true, message: '请填写预留原因' },
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
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    networkParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
      }
    },
  },
  methods: {
    IPValidator (rule, value, callback) {
      if (validate(value, 'IPv4') === false || validate(value, 'IPv4').result === false) {
        callback(new Error('请输入合法的IP'))
      } else {
        callback()
      }
    },
    checkIp (i) {
      return async (rule, value, callback) => {
        const params = {
          search: value,
        }
        try {
          const data = await new this.$Manager('reservedips').list({ params })
          if (data.data.data.length >= 1) {
            return callback(new Error('该IP已被预留,请勿重复添加'))
          } else {
            const ipsVal = Object.values(this.form.fc.getFieldValue('networkIps'))
            const ipsKey = Object.keys(this.form.fc.getFieldValue('networkIps'))
            if (ipsVal.indexOf(value) !== -1 && ipsKey[ipsVal.indexOf(value)] !== i) {
              return callback(new Error('请勿重复添加相同IP'))
            }
            return callback()
            // const ipsRepreat = Array.from(new Set(ips))
            // if (ipsRepreat.length === ips.length) {
            //   return callback()
            // } else {
            //   return callback(new Error('请勿重复添加相同IP'))
            // }
          }
        } catch {
          return callback()
        }
      }
    },
    doCreate (data) {
      return new this.$Manager('networks').performAction({
        id: data.network,
        action: 'reserve-ip',
        data: {
          ips: Object.values(data.networkIps),
          notes: data.notes,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        await this.doCreate(values)
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
