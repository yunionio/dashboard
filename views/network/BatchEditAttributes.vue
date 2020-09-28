<template>
  <div>
    <a-spin :spinning="loading">
      <page-header :title="$t('network.text_606')" />
      <a-card :bordered="false" size="small">
        <template #title>
          <dialog-selected-tips :name="$t('network.text_565')" :count="networks.length" :action="$t('network.text_606')" />
        </template>
        <dialog-table :data="networks" :columns="renderColumns" />
      </a-card>
      <div class="form-wrapper">
        <a-form v-bind="formItemLayout" :form="form.fc" @submit.prevent="handleSubmit">
          <a-form-item :label="$t('network.text_551')" :validate-status="ipSubnetsValidateStatus" :help="ipSubnetsHelp" required>
            <ip-subnets
              ref="ipSubnetsRef"
              :decorator="decorators.ipSubnets"
              :hiddenAddAction="true"
              :hiddenDeleteAction="true"
              @clear-error="clearIpSubnetsError" />
          </a-form-item>
          <page-footer>
            <template v-slot:right>
              <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting" size="large">{{$t('network.text_30')}}</a-button>
            </template>
          </page-footer>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from './mixins/columns'
import IpSubnets from './components/IpSubnets'
import { uuid } from '@/utils/utils'
import i18n from '@/locales'

const validateGateway = function (rule, value, callback) {
  const ipItems = value.split('.')
  const msg = i18n.t('network.text_591')
  if (ipItems[ipItems.length - 1] === '0') {
    callback(msg)
  } else {
    callback()
  }
}

export default {
  name: 'BatchEditAttributes',
  components: {
    IpSubnets,
  },
  mixins: [ColumnsMixin],
  data () {
    return {
      loading: false,
      submiting: false,
      networks: [],
      networkIds: [],
      ipSubnetsValidateStatus: '',
      ipSubnetsHelp: '',
      decorators: {
        ipSubnets: {
          name: i => [
            `name[${i}]`,
            {
              initialValue: '',
            },
          ],
          startip: i => [
            `startip[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('network.text_593') },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          endip: i => [
            `endip[${i}]`,
            {
              initialValue: '',
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('network.text_594') },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          netmask: i => [
            `netmask[${i}]`,
            {
              initialValue: '24',
              rules: [
                { required: true, message: this.$t('network.text_595') },
              ],
            },
          ],
          gateway: i => [
            `gateway[${i}]`,
            {
              initialValue: '',
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { validator: this.$validate('IPv4') },
                { validator: validateGateway },
              ],
            },
          ],
          vlan: i => [
            `vlan[${i}]`,
            {
              initialValue: '',
            },
          ],
        },
      },
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 23 },
          xl: { span: 23 },
          xxl: { span: 23 },
        },
        labelCol: {
          md: { span: 1 },
          xl: { span: 1 },
          xxl: { span: 1 },
        },
      },
    }
  },
  computed: {
    isRender () {
      return this.networks.length > 0
    },
    renderColumns () {
      const hiddenColumns = ['metadata', 'schedtag', 'is_auto_alloc', 'brand', 'account', 'public_scope']
      return this.columns.filter((item) => {
        return !hiddenColumns.includes(item.field)
      })
    },
  },
  created () {
    this.fetchData()
    this.$watch('networks', () => {
      if (this.networks) {
        this.$refs.ipSubnetsRef.ipSubnets = []
        this.networks.forEach(item => {
          const key = uuid()
          this.networkIds.push(item.id)
          this.$refs.ipSubnetsRef.ipSubnets.push({ key })
          const fieldKeys = Object.keys(this.decorators.ipSubnets)

          fieldKeys.forEach(field => {
            this.form.fc.getFieldDecorator(`[${field}][${key}]`, this.decorators.ipSubnets[field](key)[1])
          })

          this.$nextTick(() => {
            this.form.fc.setFieldsValue({ [`name[${key}]`]: item.name })
            this.form.fc.setFieldsValue({ [`startip[${key}]`]: item.guest_ip_start })
            this.form.fc.setFieldsValue({ [`endip[${key}]`]: item.guest_ip_end })
            this.form.fc.setFieldsValue({ [`netmask[${key}]`]: item.guest_ip_mask + '' })
            this.form.fc.setFieldsValue({ [`gateway[${key}]`]: item.guest_gateway })
            this.form.fc.setFieldsValue({ [`vlan[${key}]`]: item.vlan_id })
          })
        })
      }
    })
  },
  methods: {
    fetchData () {
      const m = new this.$Manager('networks')
      let ids = [this.$route.query.id]
      if (Array.isArray(this.$route.query.id)) {
        ids = this.$route.query.id
      }
      this.loading = true
      m.batchGet({ id: ids })
        .then((res) => {
          const { data } = res.data
          this.networks = data
          this.loading = false
        })
        .catch((err) => {
          this.loading = false
          throw err
        })
    },
    clearIpSubnetsError () {
      this.ipSubnetsValidateStatus = ''
      this.ipSubnetsHelp = ''
    },
    doUpdate (data) {
      return new this.$Manager('networks').batchUpdate({
        ids: this.networkIds,
        data,
        params: { batch_params: true },
      })
    },
    genData (values) {
      const data = []
      R.forEachObjIndexed((value, key) => {
        const obj = {
          name: values.name[key],
          guest_gateway: values.gateway[key],
          guest_ip_end: values.endip[key],
          guest_ip_mask: values.netmask[key],
          guest_ip_start: values.startip[key],
          vlan_id: values.vlan[key] === '' ? '1' : values.vlan[key],
        }
        data.push(obj)
      }, values.startip)
      return data
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.form.fc.validateFields()
        const data = this.genData(values)
        await this.doUpdate(data)
        this.$router.push('/network')
      } catch (err) {
        throw err
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
