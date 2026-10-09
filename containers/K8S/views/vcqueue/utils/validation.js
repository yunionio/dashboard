const MEMORY_MULTIPLIERS = {
  Ei: 1024 ** 6,
  Pi: 1024 ** 5,
  Ti: 1024 ** 4,
  Gi: 1024 ** 3,
  Mi: 1024 ** 2,
  Ki: 1024,
  E: 1000 ** 6,
  P: 1000 ** 5,
  T: 1000 ** 4,
  G: 1000 ** 3,
  M: 1000 ** 2,
  K: 1000,
}

export function parseCpuToMillicores (value) {
  const v = (value || '').trim()
  if (!v) return null
  if (v.endsWith('m')) {
    const n = Number.parseFloat(v.slice(0, -1))
    return Number.isFinite(n) ? n : null
  }
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n * 1000 : null
}

export function parseMemoryToBytes (value) {
  const v = (value || '').trim()
  if (!v) return null
  const match = /^(\d+(?:\.\d+)?)(Ei|Pi|Ti|Gi|Mi|Ki|E|P|T|G|M|K)?$/i.exec(v)
  if (!match) return null
  const amount = Number.parseFloat(match[1])
  if (!Number.isFinite(amount)) return null
  const suffix = match[2]
  if (!suffix) return amount
  const mult = MEMORY_MULTIPLIERS[suffix[0].toUpperCase() + suffix.slice(1).toLowerCase()]
  return mult ? amount * mult : null
}

export function normalizeDeservedFromGuarantee (guarantee, deserved) {
  return {
    cpu: (deserved.cpu || '').trim() || (guarantee.cpu || '').trim(),
    memory: (deserved.memory || '').trim() || (guarantee.memory || '').trim(),
  }
}

function compareCpu (deserved, limit, relation) {
  const d = parseCpuToMillicores(deserved)
  const l = parseCpuToMillicores(limit)
  if (d === null || l === null) return null
  return relation === 'gte' ? d >= l : d <= l
}

function compareMemory (deserved, limit, relation) {
  const d = parseMemoryToBytes(deserved)
  const l = parseMemoryToBytes(limit)
  if (d === null || l === null) return null
  return relation === 'gte' ? d >= l : d <= l
}

function pushCompare (messages, ok, failCode) {
  if (ok === false) messages.push(failCode)
  if (ok === null) messages.push('invalid_quantity')
}

export function validateQueueResources (guarantee, capability, deserved) {
  const messages = []
  const d = normalizeDeservedFromGuarantee(guarantee, deserved)
  const gcpu = (guarantee.cpu || '').trim()
  const gmem = (guarantee.memory || '').trim()
  const ccpu = (capability.cpu || '').trim()
  const cmem = (capability.memory || '').trim()

  if (gcpu) {
    if (!d.cpu) messages.push('deserved_cpu_required')
    else pushCompare(messages, compareCpu(d.cpu, gcpu, 'gte'), 'deserved_cpu_lt_guarantee')
  }
  if (gmem) {
    if (!d.memory) messages.push('deserved_memory_required')
    else pushCompare(messages, compareMemory(d.memory, gmem, 'gte'), 'deserved_memory_lt_guarantee')
  }
  if (ccpu && d.cpu) {
    pushCompare(messages, compareCpu(d.cpu, ccpu, 'lte'), 'deserved_cpu_gt_capability')
  }
  if (cmem && d.memory) {
    pushCompare(messages, compareMemory(d.memory, cmem, 'lte'), 'deserved_memory_gt_capability')
  }

  return {
    valid: messages.length === 0,
    messages: Array.from(new Set(messages)),
    deserved: d,
  }
}
