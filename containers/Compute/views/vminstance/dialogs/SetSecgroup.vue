<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1116')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" :message="message" />
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1116')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <loader loading v-if="!(bindedSecgroupsLoaded && secgroupsInitLoaded)" />
      <a-form :form="form.fc" hideRequiredMark v-show="bindedSecgroupsLoaded && secgroupsInitLoaded" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.nic')" :extra="$t('compute.nic_empty_secgroups_tip')">
          <base-select
            class="w-100"
            v-decorator="decorators.nic"
            :options="nicOptions"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_193') }"
            @change="handleNicChange" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_105')">
          <div slot="extra">{{$t('compute.text_1242', [max])}}<!-- <help-link :href="href">{{$t('compute.text_189')}}</help-link> -->
            <dialog-trigger :vm="params.vm" :extParams="{ tenant, domain }" :name="$t('compute.text_189')" value="CreateSecgroupDialog" resource="secgroups" @success="successCallback" />
          </div>
          <base-select
            ref="secgroupRef"
            class="w-100"
            remote
            show-sync
            v-decorator="decorators.secgroups"
            resource="secgroups"
            :resList.sync="secgroupOptions"
            :mapper="mapperSecgroups"
            :params="secgroupsParams"
            :init-loaded.sync="secgroupsInitLoaded"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_190'), mode: 'multiple' }" />
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import { SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH } from '@/constants/event-bus'

export default {
  name: 'VmSetSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const validateSecgroups = (rule, value, callback) => {
      const maxError = this.isBindOne ? this.$t('compute.text_1243') : this.$t('compute.text_1244')
      const minError = this.$t('compute.text_192')
      const max = this.isBindOne ? 1 : 5
      if (value.length > max) {
        return callback(maxError)
      }
      if (value.length < 1) {
        return callback(minError)
      }
      return callback()
    }

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          nic: null,
        },
      },
      decorators: {
        nic: [
          'nic',
          {
            initialValue: undefined,
            rules: [
              { required: false, message: this.$t('compute.text_193') },
            ],
          },
        ],
        secgroups: [
          'secgroups',
          {
            initialValue: this.params.data[0].secgroups && this.params.data[0].secgroups.map(item => item.id),
            validateFirst: true,
            rules: [
              { validator: validateSecgroups, trigger: 'change' },
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
      secgroupsInitLoaded: false,
      bindedSecgroups: [],
      bindedSecgroupsLoaded: false,
      secgroupOptions: [],
      nicOptions: [],
    }
  },
  computed: {
    selectedNic () {
      if (!this.form.fd.nic) return null
      return this.nicOptions.find(item => item.value === this.form.fd.nic)
    },
    ...mapGetters(['isAdminMode', 'scope']),
    isAzure () {
      return this.params.data[0].provider === HYPERVISORS_MAP.azure.provider
    },
    isUCloud () {
      return this.params.data[0].provider === HYPERVISORS_MAP.ucloud.provider
    },
    isZStack () {
      return this.params.data[0].provider === HYPERVISORS_MAP.zstack.provider
    },
    isBindOne () {
      return this.isAzure || this.isUCloud || this.isZStack
    },
    message () {
      let str = this.$t('compute.text_1245')
      if (this.isBindOne) {
        str = this.$t('compute.text_1246')
      }
      return str
    },
    href () {
      const url = this.$router.resolve('/secgroup')
      return url.href
    },
    max () {
      if (this.isBindOne) {
        return 1
      }
      return 5
    },
    domain () {
      return this.params.data[0].domain_id
    },
    tenant () {
      return this.params.data[0].tenant_id
    },
    secgroupsParams () {
      const params = { limit: 20 }
      if (this.isAdminMode) {
        params.project_domain = this.params.data[0].domain_id
      } else {
        params.scope = this.scope
      }
      if (this.params.data[0] && this.params.data[0].vpc_id) {
        params.vpc_id = this.params.data[0].vpc_id.split(',')[0]
      }
      return params
    },
  },
  created () {
    this.initNicOptions()
    this.fetchBindedSecgroups()
  },
  methods: {
    initNicOptions () {
      const nics = this.params.data[0].nics || []
      this.nicOptions = nics.map(nic => {
        const label = `${this.$t('compute.text_193')}${nic.index} (${nic.ip_addr || nic.mac})`
        return {
          label,
          value: nic.mac,
          ...nic,
        }
      })
    },
    async handleNicChange (value) {
      // 更新 fd.nic
      this.form.fd.nic = value
      // 先清空当前选中的安全组
      this.form.fc.setFieldsValue({ secgroups: [] })
      // 等待安全组选择器更新
      await this.$nextTick()
      // 加载安全组数据
      await this.fetchBindedSecgroups()
      // 确保安全组选择器已加载选项
      if (this.$refs.secgroupRef) {
        await this.$refs.secgroupRef.loadOpts()
      }
      // 设置安全组
      await this.$nextTick()
      if (this.selectedNic) {
        // 如果选择了网卡，使用网卡绑定的安全组
        const bindedSecgroupIds = this.getBindedSecgroupIds()
        if (bindedSecgroupIds.length > 0) {
          this.form.fc.setFieldsValue({ secgroups: bindedSecgroupIds })
        }
      } else {
        // 如果清空了网卡，使用默认的虚拟机安全组
        const defaultSecgroupIds = this.params.data[0].secgroups && this.params.data[0].secgroups.map(item => item.id)
        if (defaultSecgroupIds && defaultSecgroupIds.length > 0) {
          this.form.fc.setFieldsValue({ secgroups: defaultSecgroupIds })
        }
      }
    },
    getBindedSecgroupIds () {
      if (!this.selectedNic) {
        return []
      }
      const selectedMac = this.selectedNic.value
      // 从数据中获取已绑定的安全组
      const networkSecgroups = this.params.data[0].network_secgroups || []
      const currentNicSecgroup = networkSecgroups.find(item => item.mac === selectedMac)
      if (currentNicSecgroup && currentNicSecgroup.secgroups) {
        return currentNicSecgroup.secgroups.map(item => item.id)
      }
      return []
    },
    mapperSecgroups (data) {
      let newData = [...data, ...this.bindedSecgroups]
      newData = R.uniqBy(item => item.id, newData)
      return newData
    },
    async fetchBindedSecgroups () {
      let bindedSecgroupIds = []
      if (this.selectedNic) {
        // 如果选择了网卡，获取网卡绑定的安全组
        bindedSecgroupIds = this.getBindedSecgroupIds()
      } else {
        // 如果没有选择网卡，使用虚拟机级别的安全组
        bindedSecgroupIds = this.params.data[0].secgroups ? this.params.data[0].secgroups.map(item => item.id) : []
      }

      // 获取安全组详情
      if (bindedSecgroupIds.length > 0) {
        const manager = new this.$Manager('secgroups')
        try {
          const { data: { data = [] } } = await manager.list({
            params: {
              scope: this.scope,
              filter: `id.in(${bindedSecgroupIds.join(',')})`,
            },
          })
          this.bindedSecgroups = data
        } catch (error) {
          console.error('Failed to fetch secgroups:', error)
          this.bindedSecgroups = []
        }
      } else {
        this.bindedSecgroups = []
      }

      this.decorators.secgroups[1].initialValue = bindedSecgroupIds
      this.bindedSecgroupsLoaded = true
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        // 如果选择了网卡，使用 set-network-secgroup 操作
        if (this.selectedNic) {
          const manager = new this.$Manager('servers')
          const data = {
            network_index: this.selectedNic.index,
            guest: this.params.data[0].id,
            secgroup_ids: values.secgroups,
          }
          await manager.performAction({
            id: this.params.data[0].id,
            action: 'set-network-secgroup',
            data,
          })
        } else {
          // 如果没有选择网卡，使用原来的 set-secgroup 操作
          const ids = this.params.data.map(item => item.id)
          const data = {
            secgroup_ids: values.secgroups,
          }
          if (this.params.manager) {
            await this.params.manager.batchPerformAction({
              ids,
              action: 'set-secgroup',
              data,
            })
          } else {
            await this.params.onManager('batchPerformAction', {
              id: ids,
              managerArgs: {
                action: 'set-secgroup',
                data,
              },
            })
          }
        }
        this.params.refresh && this.params.refresh()
        this.$bus.$emit(SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH)
        this.cancelDialog()
        this.$message.success(this.$t('common_360'))
      } finally {
        this.loading = false
      }
    },
    async successCallback () {
      await this.$refs.secgroupRef.loadOpts()
      const secgroups = this.form.fc.getFieldValue('secgroups')
      const newSecgroup = this.secgroupOptions[0]
      secgroups.push(newSecgroup.id)
      this.form.fc.setFieldsValue({ secgroups: secgroups })
    },
  },
}
</script>
