<template>
  <div>
    <a-divider v-if="!allSuccess" orientation="left" class="mt-5 mb-3">
      {{ type === 'host' ? $t('cloudenv.text_175') : $t('cloudenv.text_176') }}
    </a-divider>
    <a-alert v-if="list.length > 0" class="mb-3 mt-3" :type="allSuccess? 'success' : 'warning'" show-icon>
      <template slot="message" v-if="type === 'host'">
        {{allSuccess ? $t('cloudenv.text_177') :  $t('cloudenv.text_178', [noSuitableIps.join(' 、 '), noSuitableIps.length])}}
      </template>
      <template  slot="message" v-if="type === 'guest'">
        {{allSuccess ? $t('cloudenv.text_179') : $t('cloudenv.text_180', [noSuitableIps.join(' 、 '), noSuitableIps.length]) }}
      </template>
    </a-alert>
    <a-form-item :label="$t('cloudenv.text_181')" v-if="!allSuccess">
      <a-radio-group v-if="type !== 'host'" v-decorator="['isCreate', { initialValue: true }]" button-style="solid">
        <a-radio-button :value="true">{{$t('cloudenv.text_182')}}</a-radio-button>
        <a-radio-button :value="false">{{$t('cloudenv.text_183')}}</a-radio-button>
      </a-radio-group>
      <div v-show="form.fc.getFieldValue('isCreate') || form.fc.getFieldValue('isCreate') === undefined">
        <a-row :gutter="10" v-for="k in form.fc.getFieldValue('keys')" :key="k">
          <a-col :span="4">
            <a-form-item>
              <a-input :addon-before="$t('db.text_60')"  v-decorator="formatDecorator(k, 'name')" :placeholder="$t('cloudenv.text_184')" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input :addon-before="$t('network.text_607')" @change="handleIpChange" v-decorator="formatDecorator(k, 'guest_ip_start')" :placeholder="$t('cloudenv.text_185')" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input :addon-before="$t('network.text_608')" @change="handleIpChange" v-decorator="formatDecorator(k, 'guest_ip_end')" :placeholder="$t('cloudenv.text_186')" />
            </a-form-item>
          </a-col>
          <a-col :span="3">
            <a-form-item>
              <a-select class="w-100" :placeholder="$t('network.text_595')" v-decorator="formatDecorator(k, 'guest_ip_mask')" dropdownClassName="oc-select-dropdown">
                <a-select-option v-for="item in netMaskOptions" :key="item.value" :value="item.value">
                  <span class="text-color-secondary option-prefix">{{$t('common_600')}}: </span>{{item.value}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input :addon-before="$t('network.text_610')" v-decorator="formatDecorator(k, 'guest_gateway')" :placeholder="$t('cloudenv.text_187')" />
            </a-form-item>
          </a-col>
          <a-col :span="2">
            <a-button @click="handleRemove(k)" shape="circle" icon="minus" size="small" class="mt-2 ml-2" />
          </a-col>
        </a-row>
        <div class="d-flex align-items-center">
          <a-button type="primary" shape="circle" icon="plus" size="small" @click="handleAdd" />
          <a-button type="link" @click="handleAdd">{{$t('cloudenv.text_188')}}</a-button>
        </div>
      </div>
      <div v-show="!form.fc.getFieldValue('isCreate') && form.fc.getFieldValue('isCreate') !== undefined" class="mt-2">
          <a-alert :message="$t('cloudenv.text_189')" type="warning" show-icon />
      </div>
    </a-form-item>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import { isWithinRange } from '@/utils/validate'

export default {
  name: 'PrepareNetsForm',
  props: {
    type: {
      type: String,
      default: 'host',
    },
    prepareNetData: {
      type: Object,
      required: true,
    },
    form: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      netInit: {},
      noSuitableIps: [],
      netMaskOptions: [
        { label: '16', value: '16' },
        { label: '17', value: '17' },
        { label: '18', value: '18' },
        { label: '19', value: '19' },
        { label: '20', value: '20' },
        { label: '21', value: '21' },
        { label: '22', value: '22' },
        { label: '23', value: '23' },
        { label: '24', value: '24' },
        { label: '25', value: '25' },
        { label: '26', value: '26' },
        { label: '27', value: '27' },
        { label: '28', value: '28' },
        { label: '29', value: '29' },
        { label: '30', value: '30' },
      ],
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 3 },
          xxl: { span: 2 },
        },
      },
      options: {
        name: {
          initialValue: undefined,
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: this.$t('cloudenv.text_190') },
            { validator: this.$validate('resourceName') },
          ],
        },
        guest_ip_start: {
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: this.$t('cloudenv.text_191') },
            { validator: this.$validate('IPv4') },
          ],
        },
        guest_ip_end: {
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: this.$t('cloudenv.text_192') },
            { validator: this.$validate('IPv4') },
          ],
        },
        guest_ip_mask: {
          initialValue: '24',
        },
        guest_gateway: {
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: this.$t('cloudenv.text_193') },
            { validator: this.$validate('IPv4') },
            { validator: this.validateGateway },
          ],
        },
      },
    }
  },
  computed: {
    suggestedNetworks () {
      const _ = this.prepareNetData[`${this.type}_suggested_networks`]
      return _ && _.length > 0 ? _ : []
    },
    list () {
      if (this.prepareNetData && this.prepareNetData[`${this.type}s`] && this.prepareNetData[`${this.type}s`].length > 0) {
        return this.prepareNetData[`${this.type}s`]
      }
      return []
    },
    allSuccess () {
      return this.list.length > 0 && this.noSuitableIps.length === 0
    },
  },
  watch: {
    list (value) {
      if (value.length > 0 && !Object.keys(this.netInit).length) {
        this.initNets()
      }
    },
  },
  created () {
    this.form.fc.getFieldDecorator('keys', { initialValue: [], preserve: true })
    this.initNets()
    this.$nextTick(() => {
      this.form.fc.setFieldsValue({
        isCreate: this.list && this.list.length > 0,
      })
    })
  },
  mounted () {
    this.noSuitableIps = this.getNoSuitableIps()
  },
  methods: {
    getNoSuitableIps () {
      const ips = []
      for (let i = 0; i < this.list.length; i++) {
        const item = this.list[i]
        const { ip_nets } = item
        let isSuitableNetwork = false
        if (ip_nets && ip_nets.length) {
          isSuitableNetwork = ip_nets.every(o => o.suitable_network)
        }
        if (!item.suitable_network && !isSuitableNetwork) {
          ips.push(...item.ips)
        }
      }
      return ips
    },
    formatDecorator (k, id) {
      return [`${k}.${id}`, {
        ...this.options[id],
        initialValue: this.netInit[k] ? this.netInit[k][id] : undefined,
      }]
    },
    initNets () {
      const keys = []
      if (this.suggestedNetworks && this.suggestedNetworks.length > 0) {
        this.suggestedNetworks.forEach(net => {
          const key = uuid()
          keys.push(key)
          this.netInit[key] = net
        })
      }
      this.form.fc.setFieldsValue({
        keys,
      })
    },
    setSuitable () {
      const values = this.form.fc.getFieldsValue()
      if (this.list && this.list.length > 0) {
        this.list.forEach(item => {
          for (let i = 0; i < item.ips.length; i++) {
            const ip = item.ips[i]
            let isSuitable = false
            for (let i = 0; i < values.keys.length; i++) {
              const k = values.keys[i]
              const { guest_ip_start, guest_ip_end } = values[k]
              if (isWithinRange(ip, guest_ip_start, guest_ip_end)) {
                isSuitable = true
                break
              }
            }
            item.isSuitable = isSuitable
          }
        })
      }
    },
    async handleIpChange (e) {
      await this.$nextTick()
      this.setSuitable()
    },
    handleAdd () {
      const { fc } = this.form
      const keys = fc.getFieldValue('keys')
      const nextKeys = keys.concat(uuid())
      fc.setFieldsValue({
        keys: nextKeys,
      })
    },
    handleRemove (k) {
      const { fc } = this.form
      const keys = fc.getFieldValue('keys')
      fc.setFieldsValue({
        keys: keys.filter(_ => _ !== k),
      }, () => {
        this.setSuitable()
      })
    },
  },
}
</script>

<style>

</style>
