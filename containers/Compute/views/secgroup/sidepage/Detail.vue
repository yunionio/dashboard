<template>
  <detail
    :on-manager="onManager"
    :data="data"
    resource="secgroups"
    :base-info="baseInfo"
    status-module="secgroup" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'
import { getBrandTableColumn, getPublicScopeTableColumn, getRegionTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SecgroupDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    columns: Array,
    hiddenColumns: Array,
  },
  data () {
    return {
      PUBLIC_SCOPE_ZH: {
        system: this.$t('shareScope.system'),
        project: this.$t('shareScope.project'),
        none: this.$t('compute.text_1029'),
        domain: this.$t('shareScope.domain'),
      },
      baseInfo: [
        getBrandTableColumn(),
        getUserTagColumn({ onManager: this.onManager, resource: 'secgroup', columns: () => this.columns, tipName: this.$t('dictionary.secgroup') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'secgroup', columns: () => this.columns, tipName: this.$t('dictionary.secgroup') }),
        getPublicScopeTableColumn({ vm: this, resource: 'secgroups' }),
        {
          field: 'guest_cnt',
          title: this.$t('compute.text_1023'),
          formatter: ({ row }) => {
            const guestList = []
            if (row.admin_guest_cnt && this.$store.getters.isAdminMode) {
              guestList.push(<span> + {row.admin_guest_cnt} <help-tooltip name="secgroupAdminGuestCnt" /></span>)
            }
            if (row.system_guest_cnt && this.$store.getters.isAdminMode) {
              guestList.push(<span> + {row.system_guest_cnt} <help-tooltip name="secgroupSystemGuestCnt" /></span>)
            }
            return <span><a onClick={ () => this.$emit('tab-change', 'associated-instances') }>{row.guest_cnt}</a>{...guestList}</span>
          },
          hidden: () => this.hiddenColumns.includes('guest_cnt'),
        },
        {
          field: 'total_cnt',
          title: this.$t('compute.associated_instances'),
          slots: {
            default: ({ row }) => {
              return <span><a onClick={ () => this.$emit('tab-change', 'associated-instances') }>{row.total_cnt}</a></span>
            },
          },
          hidden: () => this.hiddenColumns.includes('total_cnt'),
        },
        getRegionTableColumn(),
        getCopyWithContentTableColumn({
          field: 'vpc',
          title: 'VPC',
        }),
        getCopyWithContentTableColumn({
          field: 'global_vpc',
          title: this.$t('common_307'),
          message: (row) => {
            return row.brand === 'Google' ? row.global_vpc || '-' : '-'
          },
        }),
      ],
    }
  },
}
</script>
