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
          <a-radio-group v-model="form.ip_type">
            <a-radio-button value="auto_allocation">{{$t('compute.auto_allocation')}}</a-radio-button>
            <a-radio-button value="specify_ip">{{$t('compute.specify_ip')}}</a-radio-button>
          </a-radio-group>
          <a-form-model-item v-if="form.ip_type === 'specify_ip'" prop="ip_addr">
            <a-input v-model="form.ip_addr" :placeholder="$t('common.tips.input', [$t('compute.text_386')])" />
          </a-form-model-item>
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
      },
      rules: {
        ip_addr: {
          require: true, validator: this.$validate('IPv4'),
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
    async handleConfirm () {
      this.loading = true
      try {
        const validate = await this.$refs.configForm.validate()
        if (!validate) {
          this.loading = false
          return
        }
        const data = {}
        if (this.form.ip_type === 'specify_ip') {
          data.ip_addr = this.form.ip_addr
          data.require_designated_ip = true
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
