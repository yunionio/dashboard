import _ from 'lodash'
import { mapGetters } from 'vuex'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  // getNameDescriptionTableColumn,
  getPublicScopeTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        field: 'name',
        title: i18n.t('network.text_21'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            const ret = []
            ret.push(h('list-body-cell-wrap', {
              props: {
                copy: true,
                edit: this.isPower(row),
                row,
                hideField: true,
                onManager: this.onManager,
              },
              scopedSlots: {
                default: () => { return (<side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>) },
              },
            }))
            ret.push(h('list-body-cell-wrap', {
              props: {
                edit: this.isPower(row),
                field: 'description',
                row,
                onManager: this.onManager,
              },
            }))
            return ret
          },
        },
      },
      getStatusTableColumn({ statusModule: 'network' }),
      {
        field: 'server_type',
        title: i18n.t('network.text_249'),
        width: 100,
        formatter: ({ cellValue }) => {
          return this.$t('networkServerType')[cellValue] || i18n.t('network.text_507')
        },
      },
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'network', columns: () => this.columns }),
      {
        field: 'ip',
        title: i18n.t('network.text_213'),
        width: 160,
        slots: {
          default: ({ row }) => {
            return [
              <div>{ this.$t('network.text_725', [row.guest_ip_start])}</div>,
              <div>{ this.$t('network.text_726', [row.guest_ip_end])}</div>,
            ]
          },
        },
      },
      getStatusTableColumn({ field: 'is_auto_alloc', statusModule: 'networIsAutoAlloc', title: i18n.t('common_498'), minWidth: 140 }),
      {
        field: 'ports',
        title: i18n.t('network.text_622'),
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return [
              <div class='text-truncate'>{ this.$t('network.text_727', [row.ports])}</div>,
              <div class='text-truncate'>{ this.$t('network.text_728', [row.ports_used])}</div>,
            ]
          },
        },
      },
      getCopyWithContentTableColumn({ field: 'wire', title: i18n.t('network.text_571') }),
      {
        field: 'vlan_id',
        title: 'VLAN',
        width: 60,
      },
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC', hidden: this.$store.getters.isProjectMode }),
      {
        field: 'schedtag',
        title: i18n.t('network.text_630'),
        width: 120,
        type: 'expand',
        slots: {
          content: ({ row }) => {
            const tags = _.sortBy(row.schedtags, ['default', 'name'])
            if (tags.length > 0) {
              return tags.map(tag => <a-tag class='mb-2' color='blue'>{tag.name}</a-tag>)
            }
            return [
              <div class='text-color-help'>{ this.$t('network.text_729') }</div>,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getCopyWithContentTableColumn({ field: 'account', title: i18n.t('network.text_196'), hidden: this.$store.getters.isProjectMode }),
      getPublicScopeTableColumn({ vm: this, resource: 'networks' }),
      getProjectTableColumn(),
      getRegionTableColumn(),
    ]
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
