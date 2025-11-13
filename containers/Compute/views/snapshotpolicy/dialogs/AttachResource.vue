<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.bind_resource')}} - {{ resourceType === 'server' ? $t('dictionary.server') : $t('dictionary.disk') }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.bind_resource')" :name="$t('dictionary.snapshotpolicy')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <loader loading v-if="!bindedDisksLoaded && !bindedServersLoaded" />
      <a-form :form="form.fc" hideRequiredMark v-else>
        <a-form-item v-if="resourceType === 'disk'" :label="$t('compute.text_376')" v-bind="formItemLayout">
          <list-select
            v-if="form.fc.getFieldValue('disks')"
            v-decorator="decorators.disks"
            :list-props="diskProps"
            :multiple="true"
            :formatter="v => v.name" />
        </a-form-item>
        <a-form-item v-else :label="$t('dictionary.server')" v-bind="formItemLayout">
          <list-select
            v-if="form.fc.getFieldValue('servers')"
            v-decorator="decorators.servers"
            :list-props="serverProps"
            :multiple="true"
            :formatter="v => v.name" />
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
import ListSelect from '@/sections/ListSelect'
import DiskPropsMixin from '../mixins/diskProps'
import ServerPropsMixin from '../mixins/serverProps'

export default {
  name: 'AttachResourceDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin, DiskPropsMixin, ServerPropsMixin],
  data () {
    return {
      loading: false,
      resourceType: this.params.data[0].type,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        disks: [
          'disks',
          {
            initialValue: [],
          },
        ],
        servers: [
          'servers',
          {
            initialValue: [],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      disksInitLoaded: false,
      bindedDisks: [],
      bindedDisksLoaded: false,
      serversInitLoaded: false,
      bindedServers: [],
      bindedServersLoaded: false,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    isAzure () {
      return this.params.data[0].provider === HYPERVISORS_MAP.azure.provider
    },
    isUCloud () {
      return this.params.data[0].provider === HYPERVISORS_MAP.ucloud.provider
    },
    message () {
      return this.$t('compute.text_1086')
    },
    diskParams () {
      return { limit: 20, tenant: this.params.data[0].tenant_id }
    },
    serverParams () {
      return { limit: 20, tenant: this.params.data[0].tenant_id, cloud_env: 'onpremise' }
    },
  },
  watch: {
    bindedDisks (val) {
      if (val) {
        const ids = val.map((item) => { return item.id })
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ disks: ids })
        })
      }
    },
    bindedServers (val) {
      if (val) {
        const ids = val.map((item) => { return item.id })
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ servers: ids })
        })
      }
    },
  },
  created () {
    if (this.resourceType === 'disk') {
      this.fetchBindedDisks()
    } else {
      this.fetchBindedServers()
    }
  },
  methods: {
    mapperDisks (data) {
      data = data.concat(this.bindedDisks)
      data = R.uniqBy(item => item.id, data)
      data = data.filter((item) => { return ['OneCloud', 'Qcloud', 'Aliyun'].includes(item.brand) && item.guest_count > 0 })
      return data
    },
    mapperServers (data) {
      data = data.concat(this.bindedServers)
      data = R.uniqBy(item => item.id, data)
      return data
    },
    async fetchBindedDisks () {
      const manager = new this.$Manager('disks')
      try {
        const { data: { data = [] } } = await manager.list({
          params: {
            scope: this.scope,
            snapshotpolicy_id: this.params.data[0].id,
          },
        })
        this.bindedDisks = data
        this.bindedDisksLoaded = true
      } catch (error) {
        throw error
      }
    },
    async fetchBindedServers () {
      const manager = new this.$Manager('servers')
      try {
        const { data: { data = [] } } = await manager.list({
          params: {
            scope: this.scope,
            snapshotpolicy_id: this.params.data[0].id,
          },
        })
        this.bindedServers = data
        this.bindedServersLoaded = true
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      const manager = new this.$Manager(this.resourceType === 'disk' ? 'disks' : 'snapshotpolicies')
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.resourceType === 'disk' ? values.disks : values.servers
        const resource = this.resourceType === 'disk' ? this.getDisks(ids, this.bindedDisks) : this.getServers(ids, this.bindedServers)
        const data = {
          snapshotpolicy_id: this.params.data[0].id,
        }
        if (this.resourceType === 'disk') {
          if (resource.addDisks.length > 0) {
            await manager.batchPerformAction({
              ids: resource.addDisks,
              action: 'bind-snapshotpolicy',
              data,
            })
          }
          if (resource.delDisks.length > 0) {
            await manager.batchPerformAction({
              ids: resource.delDisks,
              action: 'unbind-snapshotpolicy',
              data,
            })
          }
        } else {
          if (resource.addServers.length > 0) {
            await manager.performAction({
              id: this.params.data[0].id,
              action: 'bind-resources',
              data: {
                resources: resource.addServers.map((item) => { return { id: item, type: 'server' } }),
              },
            })
          }
          if (resource.delServers.length > 0) {
            await manager.performAction({
              id: this.params.data[0].id,
              action: 'unbind-resources',
              data: {
                resources: resource.delServers.map((item) => { return { id: item, type: 'server' } }),
              },
            })
          }
        }
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    getDisks (newDisks = [], oldDisks = []) {
      const addDisks = []
      const delDisks = []
      const oldDiskIds = oldDisks.map((item) => { return item.id })
      newDisks.forEach((diskId) => {
        if (!oldDiskIds.includes(diskId)) {
          addDisks.push(diskId)
        }
      })
      oldDiskIds.forEach((diskId) => {
        if (!newDisks.includes(diskId)) {
          delDisks.push(diskId)
        }
      })
      return {
        addDisks,
        delDisks,
      }
    },
    getServers (newServers = [], oldServers = []) {
      const addServers = []
      const delServers = []
      const oldServerIds = oldServers.map((item) => { return item.id })
      newServers.forEach((serverId) => {
        if (!oldServerIds.includes(serverId)) {
          addServers.push(serverId)
        }
      })
      oldServerIds.forEach((serverId) => {
        if (!newServers.includes(serverId)) {
          delServers.push(serverId)
        }
      })
      return {
        addServers,
        delServers,
      }
    },
  },
}
</script>
