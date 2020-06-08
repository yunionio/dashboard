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

export default {
  created () {
    this.columns = [
      {
        field: 'name',
        title: '名称',
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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'network', columns: () => this.columns }),
      {
        field: 'ip',
        title: 'IP地址',
        width: 160,
        slots: {
          default: ({ row }) => {
            return [
              <div>起：{ row.guest_ip_start }</div>,
              <div>止：{ row.guest_ip_end }</div>,
            ]
          },
        },
      },
      {
        field: 'server_type',
        title: '类型',
        width: 100,
        formatter: ({ cellValue }) => {
          return this.$t('networkServerType')[cellValue] || '未知'
        },
      },
      getStatusTableColumn({ statusModule: 'network' }),
      {
        field: 'ports',
        title: '使用情况',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return [
              <div class='text-truncate'>总计:{ row.ports }</div>,
              <div class='text-truncate'>使用:{ row.ports_used }</div>,
            ]
          },
        },
      },
      getCopyWithContentTableColumn({ field: 'wire', title: '二层网络' }),
      {
        field: 'vlan_id',
        title: 'VLAN',
        width: 60,
      },
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
      {
        field: 'schedtag',
        title: '调度标签',
        width: 120,
        type: 'expand',
        slots: {
          content: ({ row }) => {
            const tags = _.sortBy(row.schedtags, ['default', 'name'])
            if (tags.length > 0) {
              return tags.map(tag => <a-tag class='mb-2' color='blue'>{tag.name}</a-tag>)
            }
            return [
              <div class='text-color-help'>无调度标签</div>,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getCopyWithContentTableColumn({ field: 'account', title: '云账号' }),
      getPublicScopeTableColumn({ vm: this }),
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
