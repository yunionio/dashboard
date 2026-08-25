export const getServerGpuBinds = (data, resource) => {
  if (resource === 'servers') {
    return data.map(item => {
      return {
        server_id: item.id,
        gpu_ids: (item.isolated_devices || []).map(gpu => gpu.id),
      }
    })
  }
  if (resource === 'isolated_devices') {
    const map = {}
    data.forEach(item => {
      ;(item.guest_ids || []).forEach(guestId => {
        if (!map[guestId]) {
          map[guestId] = []
        }
        map[guestId].push(item.id)
      })
    })
    return Object.keys(map).map(serverId => {
      return {
        server_id: serverId,
        gpu_ids: [...new Set(map[serverId])],
      }
    })
  }
  if (resource === 'guestisolateddevices') {
    const map = {}
    data.forEach(item => {
      if (!map[item.guest_id]) {
        map[item.guest_id] = []
      }
      map[item.guest_id].push(item.isolated_device_id)
    })
    return Object.keys(map).map(serverId => {
      return {
        server_id: serverId,
        gpu_ids: [...new Set(map[serverId])],
      }
    })
  }
  return []
}
