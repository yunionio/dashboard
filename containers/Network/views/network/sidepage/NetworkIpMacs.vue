<template>
  <page-list
    :list="list"
    :columns="columns"
    :singleActions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { PROVIDER_MAP } from '@/constants'

export default {
  name: 'NetworkIpMacs',
  mixins: [WindowsMixin, ListMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'NetworkIpMacsForNetworkSidePage',
        resource: 'network_ip_macs',
        getParams: {
          details: true,
          network_id: this.data.id,
        },
      }),
      columns: [
        {
          field: 'ip_addr',
          title: 'IP',
        },
        {
          field: 'mac_addr',
          title: this.$t('network.text_228'),
        },
      ],
      singleActions: [
        {
          label: this.$t('common.edit'),
          action: (obj) => {
            this.createDialog('NetworkIpMacsCreateDialog', {
              data: [this.data],
              editData: [obj],
              name: this.$t('dictionary.network'),
              ok: () => {
                this.list.fetchData()
              },
            })
          },
          meta: (obj) => {
            if (!this.isPower(this.data)) {
              return {
                validate: false,
                tooltip: this.$t('network.text_627'),
              }
            }
            return { validate: true }
          },
        },
        {
          label: this.$t('common.delete'),
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('network.mac_ip.mapping_table'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            if (!this.isPower(this.data)) {
              return {
                validate: false,
                tooltip: this.$t('network.text_627'),
              }
            }
            if (!this.$getDeleteResult(obj).validate) {
              return {
                validate: false,
                tooltip: this.$getDeleteResult(obj).tooltip,
              }
            }
            return { validate: true }
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('NetworkIpMacsCreateDialog', {
              data: [this.data],
              name: this.$t('dictionary.network'),
              ok: () => {
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            const isOneCloud = this.data.brand === 'OneCloud'
            const provider = this.data.provider
            if (!isOneCloud) {
              return {
                validate: false,
                tooltip: !isOneCloud && this.$t('common.not_support_validate_tips', [PROVIDER_MAP[provider].label]),
              }
            }
            if (!this.isPower(this.data)) {
              return {
                validate: false,
                tooltip: this.$t('network.text_627'),
              }
            }
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
        {
          label: this.$t('network.mac_ip.import_mapping_table'),
          action: () => {
            this.createDialog('ImportNetworkIpMacsDialog', {
              data: [this.data],
              ok: () => {
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            const isOneCloud = this.data.brand === 'OneCloud'
            const provider = this.data.provider
            if (!isOneCloud) {
              return {
                validate: false,
                tooltip: !isOneCloud && this.$t('common.not_support_validate_tips', [PROVIDER_MAP[provider].label]),
              }
            }
            if (!this.isPower(this.data)) {
              return {
                validate: false,
                tooltip: this.$t('network.text_627'),
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: this.$t('common.delete'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('network.mac_ip.mapping_table'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            if (!this.isPower(this.data)) {
              return {
                validate: false,
                tooltip: this.$t('network.text_627'),
              }
            }
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
</script>
