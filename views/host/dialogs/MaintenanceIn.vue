<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">进入维护模式</div>
    <div slot="body">
      <a-alert
        class="mb-2"
        message="提示:"
        description="宿主机进入维护模式后，宿主机上的虚拟机将会自动迁移到其它宿主机上。若宿主机未成功进入维护模式，需要用户手动将宿主机上的虚拟机关机，待虚拟机关机后再次尝试进入维护模式。"
        type="warning" />
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" action="进入维护模式" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
      <div class="mb-2">
        <span>宿主机上的虚拟机列表（ {{servers.length}} 台）</span>
      </div>
      <dialog-table :data="this.servers" :columns="columns" />
      <p style="color: #f56c6c; font-size: 12px;" v-if="disabled">提示: {{error}}</p>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="disabled">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import { getStatusTableColumn } from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostMaintenanceInDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      servers: [],
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        {
          field: 'ips',
          title: 'IP',
        },
        getStatusTableColumn({ statusModule: 'server' }),
      ],
    }
  },
  computed: {
    disabled () {
      const isDisabled = this.servers.every((item) => {
        // 宿主机下的虚拟机的状态只能是ready、running、unknown三者中任意一种，否则不允许进入维护模式
        if (!['ready', 'running', 'unknown'].includes(item.status)) {
          return false
        }
        // 如果宿主机下的任意一个虚拟机有备份机也不允许进入维护模式
        if (item.backup_host_id) {
          return false
        }
        // 如果宿主机下的任意一个虚拟机挂载了GPU或光盘且虚拟机处于运行中也不允许进入维护模式
        if (item.status === 'running' && (item.is_gpu || item.cdrom)) {
          return false
        }
        // 如果宿主机的host_status=offline并且宿主机下的任意一台虚拟机的状态不是unknown则不允许进入维护模式
        if (item.status !== 'unknown' && this.params.data[0].host_status === 'offline') {
          return false
        }
        return true
      })
      return !isDisabled
    },
    error () {
      let message = ''
      this.servers.map((item) => {
        // 宿主机下的虚拟机的状态只能是ready、running、unknown三者中任意一种，否则不允许进入维护模式
        if (!['ready', 'running', 'unknown'].includes(item.status)) {
          message = '宿主机下的虚拟机的状态只能是ready、running、unknown三者中任意一种，否则不允许进入维护模式'
        }
        // 如果宿主机下的任意一个虚拟机有备份机也不允许进入维护模式
        if (item.backup_host_id) {
          message = '如果宿主机下的任意一个虚拟机有备份机也不允许进入维护模式'
        }
        // 如果宿主机下的任意一个虚拟机挂载了GPU或光盘且虚拟机处于运行中也不允许进入维护模式
        if (item.status === 'running' && (item.is_gpu || item.cdrom)) {
          message = '如果宿主机下的任意一个虚拟机挂载了GPU或光盘且虚拟机处于运行中也不允许进入维护模式'
        }
        // 如果宿主机的host_status=offline并且宿主机下的任意一台虚拟机的状态不是unknown则不允许进入维护模式
        if (item.status !== 'unknown' && this.params.data[0].host_status === 'offline') {
          message = '如果宿主机的host_status=offline并且宿主机下的任意一台虚拟机的状态不是unknown则不允许进入维护模式'
        }
      })
      return message
    },
  },
  created () {
    this.fetchServersByHost()
  },
  methods: {
    fetchServersByHost () {
      const manager = new this.$Manager('servers')
      const id = this.params.data[0].id
      manager.list({ params: { host: id, scope: this.scope } }).then((res) => {
        this.servers = res.data.data
      }).catch(() => {
        this.servers = []
      })
    },
    doMaintenance () {
      return this.params.onManager('batchPerformAction', {
        id: this.params.data.map(item => item.id),
        managerArgs: {
          action: 'host-maintenance',
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doMaintenance()
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
