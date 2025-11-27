<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_26')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_211')" v-bind="formItemLayout">
          <template v-if="hasNetwork">
            <div>
              <span>{{ networkDesc }}</span>
              <span class="text-color-help">{{ $t('common.text00001') }}：{{ params.network.ports - params.network.ports_used }}</span>
            </div>
          </template>
          <template v-else>
            <base-select
              :remote="true"
              needParams
              v-decorator="decorators.network"
              resource="networks"
              :params="networkParams"
              :remote-fn="q => ({ filter: `name.contains(${q})` })"
              :select-props="{ placeholder: $t('network.text_212') }" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('network.text_213')" v-bind="formItemLayout" required>
          <ip-address
            :decorators="decorators"
            :form="form.fc" />
        </a-form-item>
        <a-form-item :label="$t('network.text_641')" v-bind="formItemLayout">
          <a-textarea
            :placeholder="$t('network.text_643')"
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
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { validate } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import IpAddress from '../components/IpAddress'

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
              { required: true, message: this.$t('network.text_212') },
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
                message: this.$t('network.text_217'),
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
              { required: true, message: this.$t('network.text_643') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
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
    hasNetwork () {
      return !R.isEmpty(this.params.network) && !R.isNil(this.params.network)
    },
    networkDesc () {
      const netInfo = []
      if (this.params.network.guest_ip_start && this.params.network.guest_ip_end) {
        netInfo.push(this.params.network.guest_ip_start + '/' + this.params.network.guest_ip_mask + '-' + this.params.network.guest_ip_end + '/' + this.params.network.guest_ip_mask)
      }
      if (this.params.network.guest_ip6_start && this.params.network.guest_ip6_end) {
        netInfo.push(this.params.network.guest_ip6_start + '/' + this.params.network.guest_ip6_mask + '-' + this.params.network.guest_ip6_end + '/' + this.params.network.guest_ip6_mask)
      }
      netInfo.push('vlan=' + this.params.network.vlan_id)
      return this.params.network.name + '(' + netInfo.join(',') + ')'
    },
  },
  methods: {
    IPValidator (rule, value, callback) {
      if ((validate(value, 'IPv4') === false || validate(value, 'IPv4').result === false) && (validate(value, 'IPv6') === false || validate(value, 'IPv6').result === false)) {
        callback(new Error(this.$t('network.text_301')))
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
            return callback(new Error(this.$t('network.text_645')))
          } else {
            const ipsVal = Object.values(this.form.fc.getFieldValue('networkIps'))
            const ipsKey = Object.keys(this.form.fc.getFieldValue('networkIps'))
            if (ipsVal.indexOf(value) !== -1 && ipsKey[ipsVal.indexOf(value)] !== i) {
              return callback(new Error(this.$t('network.text_644')))
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
        const values = await this.form.fc.validateFields()
        if (this.hasNetwork) {
          values.network = this.params.network.id
        }
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
