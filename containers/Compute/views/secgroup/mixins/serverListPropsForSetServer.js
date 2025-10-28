import _ from 'lodash'
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

export default {
  data () {
    // const tenant_id = _.get(this.params, 'data[0].tenant_id')
    const brand = _.get(this.params, 'data[0].brand')
    const vpc_id = _.get(this.params, 'data[0].vpc_id')
    const hypervisor = _.get(this.params, 'hypervisor')
    const getParams = {
      filter: hypervisor === 'pod' ? 'hypervisor.in(pod)' : 'hypervisor.notin(container,baremetal,pod)',
      // project_id: tenant_id,
      scope: this.$store.getters.scope,
    }
    if (brand === 'Aws') {
      getParams.vpc_id = vpc_id
    }
    return {
      serverListProps: {
        list: this.$list.createList(this, {
          resource: 'servers',
          getParams,
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
      },
    }
  },
}
