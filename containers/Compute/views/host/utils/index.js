export const getHostSpecInfo = (obj) => {
  let cpu_reserved = 0
  const {
    metadata = {},
    cpu_count,
    cpu_commit_rate,
    cpu_commit,
    cpu_commit_bound = 1,
    mem_size,
    mem_reserved = 0,
    mem_commit_bound = 1,
    mem_commit,
    mem_commit_rate,
    storage_size,
    storage_used,
    actual_storage_used,
    storage_commit_rate,
    storage_virtual,
    cpu_usage_percent = 0,
    memory_used_mb = 0,
  } = obj
  const { reserved_cpus_info = '' } = metadata
  if (reserved_cpus_info) {
    const l = JSON.parse(reserved_cpus_info)
    cpu_reserved = l.cpus.split(',').length
  }
  const cpuUsedPercent = cpu_usage_percent / 100
  const cpuUsed = cpu_count * cpuUsedPercent
  const ret = {
    cpu_count,
    cpu_used: cpuUsed > 0 && cpuUsed < 0.5 ? 1 : cpuUsed,
    cpu_reserved,
    cpu_count_virtual: (cpu_count - cpu_reserved) * cpu_commit_bound,
    cpu_commit,
    cpu_commit_rate,
    cpu_commit_bound,
    mem_size,
    mem_used: memory_used_mb,
    mem_reserved,
    mem_size_virtual: (mem_size - mem_reserved) * mem_commit_bound,
    mem_commit,
    mem_commit_rate,
    mem_commit_bound,
    storage_size,
    storage_size_virtual: storage_virtual,
    storage_commit: storage_used,
    storage_commit_rate,
    actual_storage_used,
  }
  return ret
}
