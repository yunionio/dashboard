<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.instancegroup')" :count="params.data.length" :action="$t('compute.create_vip')" />
      <dialog-table :data="params.data" :columns="columns" :showOverflow="true" />
      <a-form-model
        ref="configForm"
        class="mt-3"
        :model="form"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('compute.text_386')" prop="ip_type">
          <div class="d-flex align-items-center">
            <a-radio-group v-model="form.ip_type">
              <a-radio-button value="auto_allocation">{{$t('compute.auto_allocation')}}</a-radio-button>
              <a-radio-button value="specify_ip">{{$t('compute.specify_ip')}}</a-radio-button>
            </a-radio-group>
            <!-- <a-checkbox v-model="form.require_ipv6" class="ml-2">{{ $t('compute.server_create.require_ipv6_all') }}</a-checkbox> -->
            <span class="ml-3 d-flex align-items-center">
              <a-checkbox style="width: max-content" v-model="form.require_ipv6" />
              <a-dropdown>
                <a-menu slot="overlay" v-model="form.ipv6_mode" @click="handleIpv6Mode">
                  <a-menu-item key="all">{{ $t('compute.server_create.require_ipv6_all') }}</a-menu-item>
                  <a-menu-item key="only">{{ $t('compute.server_create.require_ipv6_only') }}</a-menu-item>
                </a-menu>
                <a-button type="link" class="pl-1">{{ form.ipv6_mode === 'only' ? $t('compute.server_create.require_ipv6_only') : $t('compute.server_create.require_ipv6_all') }}<a-icon type="down" /> </a-button>
              </a-dropdown>
            </span>
          </div>
        </a-form-model-item>
        <a-form-model-item label="IPv4" v-if="form.ip_type === 'specify_ip' && !(form.require_ipv6 && form.ipv6_mode === 'only')" prop="ip_addr">
          <a-input v-model="form.ip_addr" :placeholder="$t('common.tips.input', [$t('compute.text_386')])" />
        </a-form-model-item>
        <a-form-model-item label="IPv6" v-if="form.ip_type === 'specify_ip' && form.require_ipv6" prop="ip6_addr">
          <a-input v-model="form.ip6_addr" :placeholder="$t('common.tips.input', [$t('compute.ipv6.address')])" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'InstanceGroupAddVipNetworkDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        ip_type: 'auto_allocation',
        ip_addr: '',
        require_ipv6: false,
        ipv6_mode: 'all',
      },
      rules: {
        ip_addr: {
          require: true, validator: this.$validate('IPv4'),
        },
        ip6_addr: {
          require: true, validator: this.$validate('IPv6'),
        },
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      secgroupsInitLoaded: false,
      bindedSecgroups: [],
      bindedSecgroupsLoaded: false,
      vpcObj: {
        id: this.params.data[0].vpc_id,
        name: this.params.data[0].vpc,
      },
    }
  },
  computed: {
    networkLimit () {
      return 8 - (this.params.total || 0)
    },
    columns () {
      return this.params.columns.filter(item => ['name', 'status', 'vips'].includes(item.field))
    },
  },
  methods: {
    handleIpv6Mode (e) {
      this.form.ipv6_mode = e.key
    },
    async handleConfirm () {
      this.loading = true
      try {
        const validate = await this.$refs.configForm.validate()
        if (!validate) {
          this.loading = false
          return
        }
        const data = {}
        if (this.form.require_ipv6) {
          data.require_ipv6 = true
        }
        if (this.form.ip_type === 'specify_ip') {
          data.ip_addr = this.form.ip_addr
          data.require_designated_ip = true
          if (this.form.require_ipv6) {
            data.ip6_addr = this.form.ip6_addr
          }
        }
        if (this.form.ipv6_mode === 'only') {
          delete data.ip_addr
        }
        const manager = new this.$Manager('instancegroups')
        await manager.performAction({
          id: this.params.data[0].id,
          action: 'attachnetwork',
          data,
        })
        this.params.refresh()
        this.$bus.$emit('VMInstanceListSingleRefresh', [this.params.resId])
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .network-item {
  width: 260px;
}
</style>
