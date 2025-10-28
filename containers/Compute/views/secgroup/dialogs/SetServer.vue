<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.secgroup')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item
          :label="params.resourceName">
          <list-select
            v-decorator="decorators.servers"
            :list-props="serverListProps"
            :formatter="v => v.name"
            :placeholder="$t('compute.text_1022', [params.resourceName])"
            :dialog-params="{ title: params.resourceName, width: 1060 }" />
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
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import ResourceProps from '../mixins/serverListPropsForSetServer'

export default {
  name: 'SetServerDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin, ResourceProps],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        servers: [
          'servers',
          {
            validateFirst: true,
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
      bindServers: [],
      bindServersLoaded: false,
      defaultValue: [],
    }
  },
  computed: {
    ...mapGetters([
      'isAdminMode',
      'isDomainMode',
      'userInfo',
    ]),
    columns () {
      return [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'guest_cnt',
          title: this.$t('compute.text_1023'),
          width: 80,
        },
        getProjectTableColumn(),
      ]
    },
    selectedResource () {
      return this.params.data[0]
    },
  },
  created () {
    this.fetchBindedServers()
  },
  methods: {
    async fetchBindedServers () {
      const manager = new this.$Manager('servers')
      try {
        const params = {
          scope: this.scope,
          filter: this.params.hypervisor === 'pod' ? 'hypervisor.in(pod)' : 'hypervisor.notin(container,baremetal,pod)',
          limit: 0,
          secgroup: `${this.selectedResource.id}`,
        }
        if (this.isAdminMode) {
          params.project_domain = this.userInfo.projectDomain
          delete params.scope
        }
        const { data: { data = [] } } = await manager.list({ params })
        this.bindServers = data
        this.bindServersLoaded = true
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ servers: data.map(item => item.id) })
        })
      } catch (error) {
        console.error(error)
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        let ids = []
        const bindServers = []
        const removeServers = []
        const data = {
          secgroup_ids: [this.selectedResource.id],
        }
        ids = JSON.parse(JSON.stringify(values.servers))
        this.bindServers.forEach((item, idx) => {
          bindServers.push(item.id)
        })
        for (var i = 0; i < bindServers.length; i++) {
          if (!R.includes(bindServers[i], ids)) {
            removeServers.push(bindServers[i])
          }
          for (var j = 0; j < ids.length; j++) {
            if (bindServers[i] === ids[j]) {
              ids.splice(j, 1)
            }
          }
        }
        if (removeServers.length > 0) {
          await new this.$Manager('servers').batchPerformAction({
            ids: removeServers,
            action: 'revoke-secgroup',
            data,
          })
        }
        if (ids.length > 0) {
          await new this.$Manager('servers').batchPerformAction({
            ids,
            action: 'add-secgroup',
            data,
          })
        }
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
