import i18n from '@/locales'

const TAG_COLORS = ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple']

export function hasPortMappings (row) {
  return (row?.nics || []).some(nic => nic.port_mappings?.length)
}

export function getPortMappingDetailColumn ({ title, hideWhenEmpty = true } = {}) {
  return {
    field: 'port_mapping',
    title: title || i18n.t('compute.repo.port_mapping'),
    slots: {
      default: ({ row }, h) => {
        const ret = []
        let index = 0
        for (const nic of (row?.nics || [])) {
          for (const pm of (nic.port_mappings || [])) {
            index++
            const color = TAG_COLORS[index % TAG_COLORS.length]
            ret.push(h('p', [
              h('a-tag', { props: { color } }, [
                `${i18n.t('compute.repo.container_port')}: ${nic.ip_addr}:${pm.port} = ${i18n.t('compute.repo.host_port')}: ${row.host_access_ip}:${pm.host_port} (${(pm.protocol || '').toUpperCase()})`,
              ]),
            ]))
          }
        }
        return ret.length ? ret : '-'
      },
    },
    hidden: hideWhenEmpty ? (row) => !hasPortMappings(row) : undefined,
  }
}
