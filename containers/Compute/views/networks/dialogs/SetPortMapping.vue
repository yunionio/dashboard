<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="tableColumns" />
      <a-form :form="form.fc">
        <a-form-item :label="$t('compute.port_mappings.title')" :extra="$t('compute.port_mappings.set_tip')">
          <labels
            ref="labelRef"
            :create-form="form"
            :decorators="decorators.portMapping"
            :init-pairs="initPortMappings"
            :title="$t('compute.repo.port_mapping')"
            :keyLabel="$t('compute.repo.container_port')"
            :valueLabel="$t('compute.repo.host_port')"
            :keyPlaceholder="$t('compute.repo.example', ['443'])"
            :valuePlaceholder="$t('compute.repo.example', ['443'])" />
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
import Labels from '@Compute/sections/Labels'
import expectStatus from '@/constants/expectStatus'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmSetPortMappingDialog',
  components: {
    Labels,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.port_mappings.set'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        portMapping: {
          key: i => [
            `containerPorts[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              rules: [
                { required: true, message: this.$t('common.tips.input', [this.$t('compute.repo.container_port')]) },
                { validator: this.validatePort(1, 65535, 'compute.port_mappings.invalid_port') },
              ],
            },
          ],
          value: i => [
            `hostPorts[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              rules: [
                { validator: this.validatePort(20000, 25000, 'compute.port_mappings.invalid_host_port') },
              ],
            },
          ],
        },
      },
    }
  },
  computed: {
    curNic () {
      return this.params.data[0]
    },
    tableColumns () {
      return (this.params.columns || []).slice(0, 3)
    },
    /** 已有端口映射，用于回填表单 & 保留未在表单中暴露的字段（protocol/remote_ips 等） */
    existingPortMappings () {
      return this.curNic.port_mappings || []
    },
    initPortMappings () {
      return this.existingPortMappings
    },
  },
  mounted () {
    // 无历史端口映射时默认给一行，方便直接填写
    if (!this.existingPortMappings.length) {
      this.$nextTick(() => this.$refs.labelRef?.add())
    }
  },
  methods: {
    /** 端口范围校验，留空表示不校验（宿主机端口留空由宿主机自动分配） */
    validatePort (min, max, messageKey) {
      return (rule, value, callback) => {
        if (value === undefined || value === null || value === '') return callback()
        const port = Number(value)
        if (!Number.isInteger(port) || port < min || port > max) {
          return callback(new Error(this.$t(messageKey, [min, max])))
        }
        return callback()
      }
    },
    toNumber (val) {
      if (val === undefined || val === null || val === '') return null
      const num = Number(val)
      return Number.isNaN(num) ? null : num
    },
    /** 按内部端口一对一匹配已有映射，尽量保留 protocol/host_ip/remote_ips 等信息 */
    matchExistingPortMapping (usedIndexes, port) {
      const list = this.existingPortMappings
      for (let i = 0; i < list.length; i++) {
        if (usedIndexes[i]) continue
        if (this.toNumber(list[i].port) === port) {
          usedIndexes[i] = true
          return list[i]
        }
      }
      return null
    },
    /**
     * 取 containerPorts / hostPorts 的值
     * 兼容 rc-form 返回嵌套对象（containerPorts: { uuid: 80 }）与平铺 key（containerPorts[uuid]: 80）两种结构
     */
    pickPortValues (values, prefix) {
      if (values[prefix] && typeof values[prefix] === 'object') {
        return values[prefix]
      }
      const ret = {}
      const reg = new RegExp(`^${prefix}\\[(.*)\\]$`)
      Object.keys(values).forEach(key => {
        const matched = key.match(reg)
        if (matched) {
          ret[matched[1]] = values[key]
        }
      })
      return ret
    },
    genPortMappings (values) {
      const containerPorts = this.pickPortValues(values, 'containerPorts')
      const hostPorts = this.pickPortValues(values, 'hostPorts')
      const usedIndexes = {}
      const ret = []
      Object.keys(containerPorts).forEach(key => {
        const port = this.toNumber(containerPorts[key])
        if (port === null) return
        const existing = this.matchExistingPortMapping(usedIndexes, port)
        const pm = existing ? { ...existing } : {}
        pm.port = port
        const hostPort = this.toNumber(hostPorts[key])
        if (hostPort === null) {
          // 留空表示由宿主机自动分配
          delete pm.host_port
        } else {
          pm.host_port = hostPort
        }
        ret.push(pm)
      })
      return ret
    },
    async doSetPortMappingSubmit (values) {
      const manager = new this.$Manager('servers')
      return manager.performAction({
        id: this.params.resId,
        action: 'set-port-mapping',
        data: {
          mac: this.curNic.mac_addr,
          port_mappings: this.genPortMappings(values),
        },
      })
    },
    /**
     * 设置端口映射是异步任务（先由宿主机分配/设置 host_port 回写，再同步配置），
     * 立即刷新网卡列表可能拿不到新分配的 host_port，故等虚机状态回到稳定态后再刷新
     */
    async waitGuestSteadyStatus () {
      const manager = new this.$Manager('servers')
      const steadyStatuses = Object.values(expectStatus.server).flat()
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
      let sawUnsteady = false
      for (let i = 0; i < 30; i++) {
        let status = ''
        try {
          const { data } = await manager.get({ id: this.params.resId })
          status = data.status
        } catch (error) {
          return
        }
        if (status && /fail/.test(status)) return
        if (steadyStatuses.includes(status)) {
          // 异步任务可能尚未开始，需确认出现过非稳定状态后，才能认为已回到稳定态
          if (sawUnsteady) return
        } else {
          sawUnsteady = true
        }
        await sleep(1000)
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doSetPortMappingSubmit(values)
        this.loading = false
        this.waitGuestSteadyStatus().then(() => this.params.refresh())
        this.$bus.$emit('VMInstanceListSingleRefresh', [this.params.resId, Object.values(expectStatus.server).flat()])
        this.$message.success(this.$t('compute.text_423'))
        this.cancelDialog()
      } catch (error) {
        // 错误提示由 http 层统一处理，这里只需恢复按钮状态
        this.loading = false
      }
    },
  },
}
</script>
