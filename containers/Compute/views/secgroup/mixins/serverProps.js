import {
  getNameDescriptionTableColumn,
  getIpsTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getIpFilter,
  getBrandFilter,
} from '@/utils/common/tableFilter'
import i18n from '@/locales'

export default {
  data () {
    const secgrp_id = this.params && this.params.data && this.params.data[0].id
    return {
      list: this.$list.createList(this, {
        resource: 'servers',
        getParams: {
          filter: this.params.hypervisor === 'pod' ? 'hypervisor.in(pod)' : 'hypervisor.notin(baremetal,container)',
          secgroup: secgrp_id,
        },
        filterOptions: {
          name: getNameFilter(),
          ips: getIpFilter(),
          brand: getBrandFilter('compute_engine_brands'),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          hideField: true,
          addLock: true,
          addBackup: true,
          edit: false,
          editDesc: false,
          minWidth: 120,
          slotCallback: row => {
            return [
              <list-body-cell-wrap field='name' row={row} />,
            ]
          },
        }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        getBrandTableColumn({ field: 'provider' }),
        getStatusTableColumn({ statusModule: 'server' }),
        getProjectTableColumn(),
        getRegionTableColumn(),
      ],
      singleActions: [
        {
          label: i18n.t('compute.text_950'),
          width: 40,
          action: (obj) => {
            const secgrpId = secgrp_id || obj.secgrp_id
            this.createDialog('RevokeSecgroupDialog', {
              data: [obj],
              secgrpId,
              refresh: () => {
                this.list.refresh()
                this.$bus.$emit('secgroup-list-refresh')
              },
            })
          },
          meta: (obj) => {
            const ret = { validate: false, tooltip: null }
            if (obj.secgroups && obj.secgroups.length === 1) {
              ret.tooltip = i18n.t('compute.text_1026')
              return ret
            }
            return {
              validate: ['running', 'ready'].includes(obj.status),
            }
          },
        },
      ],
    }
  },
}
