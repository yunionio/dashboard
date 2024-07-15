<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.change_sub_ip')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.text_193')" :count="params.data.length" :action="$t('compute.change_sub_ip')" />
      <dialog-table :data="params.data" :columns="params.columns.filter(item => ['ifname', 'mac_addr', 'ip_addr', 'network_addresses'].includes(item.field))" />
       <a-form-model
        ref="form"
        class="mt-3"
        :model="form"
        :rules="rules">
        <a-form-model-item :label="$t('compute.sub_ip')" v-bind="formItemLayout">
          <a-form-model-item v-for="(item, index) in form.subips" :key="index" :prop="`subips.${index}.ip`" class="mb-1">
            <a-row :gutter="8">
              <a-col v-if="item.from !== 'old'" :span="20" class="d-flex align-items-center">
                 <a-radio-group v-model="form.subips[index].type">
                  <a-radio-button value="allocation">{{ $t('compute.automatic_allocation') }}</a-radio-button>
                  <a-radio-button value="specify">{{ $t('compute.manually_specify') }}</a-radio-button>
                </a-radio-group>
                <base-select v-if="form.subips[index].type === 'specify'" class="ml-2" minWidth="300px" v-model="form.subips[index].ip" :options="ipList" />
              </a-col>
              <a-col :span="20" v-else>{{ item.name }}</a-col>
              <a-col :span="4">
                <a-button shape="circle" icon="minus" size="small" @click="decrease(index)" class="mt-2" />
              </a-col>
             </a-row>
          </a-form-model-item>
          <div class="d-flex align-items-center mt-1">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
            <a-button type="link" @click="add">{{$t('compute.text_822')}}</a-button>
          </div>
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
  name: 'VmNetworkChangeSubIpDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const { network_addresses = [] } = this.params.data[0]
    const originIpList = network_addresses.filter(item => item.type === 'sub_ip').map(item => item.ip_addr)
    const subips = originIpList.map(item => {
      return {
        from: 'old',
        ip: item,
        name: item,
      }
    })
    return {
      loading: false,
      scope: this.$store.getters.scope,
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      form: {
        subips,
      },
      originIpList,
      ipList: [],
    }
  },
  created () {
    this.$nM = new this.$Manager(`networks/${this.params.data[0].network_id}/available-addresses`, 'v2')
    this.$uM = new this.$Manager('servers')
    this.loadIpList()
  },
  methods: {
    loadIpList () {
      this.fetchLoading = true
      this.$nM.list({
        data: {
          scope: this.scope,
        },
      }).then(res => {
        const { addresses = [] } = res.data || {}
        this.ipList = addresses.map(item => {
          return { id: item, name: item }
        })
      })
    },
    add () {
      this.form.subips.push({ type: 'allocation', ip: '' })
    },
    decrease (index) {
      this.form.subips.splice(index, 1)
    },
    genParams () {
      const ret = {
        mac: this.params.server.macs,
        sub_ips: [],
        remove_sub_ips: [],
        count: 0,
      }
      this.form.subips.map(item => {
        if (item.from === 'old') return
        if (item.type === 'specify' && item.ip) {
          if (!this.originIpList.some(ip => ip === item.ip)) {
            ret.sub_ips.push(item.ip)
          }
          ret.count++
        }
        if (item.type === 'allocation') {
          ret.count++
        }
      })
      this.originIpList.map(ip => {
        if (!this.form.subips.some(l => (l.type === 'specify' || l.from === 'old') && l.ip === ip)) {
          ret.remove_sub_ips.push(ip)
        }
      })
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = true
        const params = this.genParams()
        await this.$uM.performAction({
          id: this.params.server.id,
          action: 'update-sub-ips',
          data: params,
        })
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
