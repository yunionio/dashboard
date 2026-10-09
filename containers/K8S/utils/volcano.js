export async function openVolcanoSidePage (vm, { sidePage, resource, name, cluster, namespace }) {
  if (!vm || !sidePage || !resource || !name || !cluster) return
  const params = {
    scope: vm.$store.getters.scope,
    limit: 20,
    details: false,
    cluster,
    'filter.0': `name.equals("${String(name).replace(/"/g, '')}")`,
  }
  if (namespace) params.namespace = namespace
  const { data } = await new vm.$Manager(resource, 'v1').list({ params })
  const rows = (data && data.data) || []
  const row = rows.find(item => item.name === name) || rows[0]
  if (!row) return
  vm.sidePageTriggerHandle(vm, sidePage, {
    id: row.id,
    resource,
    apiVersion: 'v1',
    getParams: () => {
      const next = { cluster: row.clusterID || cluster }
      if (row.namespace || namespace) next.namespace = row.namespace || namespace
      return next
    },
  })
}
