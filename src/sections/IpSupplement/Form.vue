<template>
  <a-form
    :form="form"
    :style="{ width: `${width}px` }"
    @submit="handleSubmit">
    <a-alert class="mb-2" type="warning">
      <div slot="message">
        {{ $t('help.ipSupplement') }}
      </div>
    </a-alert>
    <a-form-item :label="nicLabel(nic)" v-for="(nic, i) in localNics" :key="i">
      <div class="d-flex">
      <base-select
        class="w-100 mr-2"
        resource="wires"
        v-model="localNics[i].wire"
        :need-params="true"
        :is-default-select="true"
        :auto-load-default-select="true"
        :params="{ ...wireParamsC(nic) }"
        :select-props="{ allowClear: false }"
        :min-width="'100px'" />
      <base-select
        class="w-100 mr-2"
        resource="networks"
        v-model="localNics[i].net"
        :item.sync="localNics[i].network"
        :show-sync="true"
        :need-params="true"
        :is-default-select="true"
        :params="{ ...networkParamsC(nic) }"
        :select-props="{ allowClear: false }"
        :min-width="'200px'" />
      <ip-select v-decorator="decorators.input(i)" :value="nic.ip" :network="nic.network" @change="e => ipChange(e, i)" />
      </div>
      <div slot="extra" v-if="i === 0">{{$t('compute.text_196')}}<help-link :href="`/network/create?vpc=default&wire=${nic.wire}&domain=${domain}&project=${project}&type=idc`">{{$t('compute.perform_create')}}</help-link></div>
    </a-form-item>
    <div class="text-right">
      <a-button type="primary" html-type="submit" :loading="loading">{{$t('common.ok')}}</a-button>
      <a-button class="ml-3" @click="cancel">{{$t('common.cancel')}}</a-button>
    </div>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import IpSelect from '@Compute/sections/ServerNetwork/IpSelect.vue'

function createLocalNics (nics = []) {
  return nics.map(nic => ({
    ...nic,
    wire: nic.wire || undefined,
    net: nic.net || undefined,
    network: nic.network || {},
    ip: nic.ip || '',
  }))
}

export default {
  name: 'IpSupplementEditForm',
  components: {
    IpSelect,
  },
  props: {
    width: {
      type: Number,
      default: 820,
    },
    formLayout: {
      type: Object,
      default: () => ({
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      }),
    },
    label: {
      type: String,
      default: 'IP',
    },
    defaultValue: {
      type: String,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    nics: {
      type: Array,
      default: () => [],
    },
    host: {
      type: String,
      default: '',
    },
    domain: {
      type: String,
      default: '',
    },
    project: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      form: this.$form.createForm(this),
      localNics: createLocalNics(this.nics),
      decorators: {
        input: i => [
          `input[${i}]`,
          {
            initialValue: this.nics[i]?.ip || this.defaultValue,
            validateFirst: true,
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.label}` },
              { validator: this.$validate('IPv4') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    placeholder () {
      if (this.label) return `${this.$t('common.placeholder')}${this.label}`
      return this.$t('common.placeholder')
    },
  },
  watch: {
    nics: {
      handler (val) {
        this.localNics = createLocalNics(val)
      },
      deep: true,
    },
  },
  methods: {
    wireParamsC (nic) {
      return {
        limit: 0,
        host: this.host,
        filter: [
          `name.equals('${nic.dswitch}')`,
          `name.startswith('${nic.dswitch}-')`,
        ],
        filter_any: true,
        project_domain: this.domain,
      }
    },
    networkParamsC (nic) {
      if (!nic.wire) {
        return {}
      }
      return {
        limit: 0,
        wire: nic.wire,
        project_domain: this.domain,
        project: this.project,
      }
    },
    nicLabel (nic) {
      return `${this.$t('common.ip_supplement.nic_label')} MAC ${nic.mac} ${this.$t('common.ip_supplement.network_label')} "${nic.dswitch}"`
    },
    ipChange (val, i) {
      this.$set(this.localNics[i], 'ip', val)
    },
    cancel () {
      this.$emit('cancel')
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          const trimValue = R.map(value => {
            if (R.is(String, value)) {
              return value.trim()
            }
            return value
          }, values)
          this.$emit('submit', trimValue)
        }
      })
    },
  },
}
</script>
