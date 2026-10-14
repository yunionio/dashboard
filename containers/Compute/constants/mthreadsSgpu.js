// sGPU memory buckets in MiB. Keep in sync with AlignMthreadsSgpuMemoryMiB.
export const MTHREADS_SGPU_MEMORY_BUCKETS_MIB = [
  512,
  1 * 1024,
  2 * 1024,
  4 * 1024,
  8 * 1024,
  16 * 1024,
  32 * 1024,
  48 * 1024,
  64 * 1024,
  80 * 1024,
]

export function isMthreadsVendor (vendor) {
  return String(vendor || '').trim().toUpperCase() === 'MTHREADS'
}

export function isMthreadsSgpuMemoryBucket (value) {
  const num = Number(value)
  return Number.isInteger(num) && MTHREADS_SGPU_MEMORY_BUCKETS_MIB.includes(num)
}

export function mthreadsSgpuMemoryOptions (maxMb) {
  const max = Number(maxMb)
  return MTHREADS_SGPU_MEMORY_BUCKETS_MIB
    .filter(mb => !(max > 0) || mb <= max)
    .map(mb => ({
      key: mb,
      label: mb < 1024 ? `${mb} MiB` : `${mb / 1024} GiB`,
    }))
}

// Off-bucket values stay empty so the user has to pick a size. Do not round up in the form.
export function normalizeMthreadsSgpuMemory (value, maxMb) {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  if (!isMthreadsSgpuMemoryBucket(num)) return undefined
  const max = Number(maxMb)
  if (max > 0 && num > max) return undefined
  return num
}
