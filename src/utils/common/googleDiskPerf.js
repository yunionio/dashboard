/**
 * GCP 磁盘 provisioned IOPS / 吞吐区间（对齐 cloudmux setDiskProvisionedPerformance）
 * 容量单位 GiB，吞吐单位 MB/s
 */

function maxInt (a, b) {
  return a > b ? a : b
}

function minInt (a, b) {
  return a < b ? a : b
}

export function normalizeGoogleDiskType (diskType) {
  if (!diskType) return ''
  // capability: type/medium；独立建盘: type__medium
  return String(diskType).split('/')[0].split('__')[0]
}

function hyperdiskBalancedIopsCap (diskType) {
  return diskType === 'hyperdisk-balanced-high-availability' ? 100000 : 160000
}

function hyperdiskBalancedIopsRange (sizeGb, maxIopsCap) {
  if (sizeGb === 4) return { min: 2000, max: 2000 }
  if (sizeGb === 5) return { min: 2500, max: 2500 }
  if (sizeGb >= 6) return { min: 3000, max: minInt(500 * sizeGb, maxIopsCap) }
  return null
}

export function getGoogleDiskDefaultIops (diskType, sizeGb) {
  const type = normalizeGoogleDiskType(diskType)
  const size = Number(sizeGb)
  if (!Number.isFinite(size) || size <= 0) return null
  if (type === 'hyperdisk-balanced' || type === 'hyperdisk-balanced-high-availability') {
    const maxIopsCap = hyperdiskBalancedIopsCap(type)
    if (size <= 6) return 500 * size
    if (size <= 27307) return minInt(6 * size + 3000, maxIopsCap)
    return maxIopsCap
  }
  return null
}

/** @returns {string[]} 可配置的表单元素：iops / throughput */
export function getGoogleDiskPerfElements (diskType) {
  const type = normalizeGoogleDiskType(diskType)
  switch (type) {
    case 'pd-extreme':
    case 'hyperdisk-extreme':
      return ['iops']
    case 'hyperdisk-balanced':
    case 'hyperdisk-balanced-high-availability':
      return ['iops', 'throughput']
    case 'hyperdisk-throughput':
    case 'hyperdisk-ml':
      return ['throughput']
    default:
      return []
  }
}

/**
 * @returns {{ min: number, max: number } | null}
 */
export function getGoogleDiskIopsLimit (diskType, sizeGb) {
  const type = normalizeGoogleDiskType(diskType)
  const size = Number(sizeGb)
  if (!Number.isFinite(size) || size <= 0) return null

  switch (type) {
    case 'pd-extreme':
      return { min: 2500, max: 120000 }
    case 'hyperdisk-extreme': {
      if (size < 64) return null
      const min = 2 * size
      const max = size <= 291 ? 1200 * size : 350000
      return { min, max }
    }
    case 'hyperdisk-balanced':
    case 'hyperdisk-balanced-high-availability':
      return hyperdiskBalancedIopsRange(size, hyperdiskBalancedIopsCap(type))
    default:
      return null
  }
}

/**
 * @param {number} [iops] 当前 IOPS；balanced 类吞吐区间依赖有效 IOPS
 * @returns {{ min: number, max: number } | null}
 */
export function getGoogleDiskThroughputLimit (diskType, sizeGb, iops) {
  const type = normalizeGoogleDiskType(diskType)
  const size = Number(sizeGb)
  if (!Number.isFinite(size) || size <= 0) return null

  switch (type) {
    case 'hyperdisk-balanced':
    case 'hyperdisk-balanced-high-availability': {
      let effectiveIops = Number(iops)
      const iopsLimit = getGoogleDiskIopsLimit(type, size)
      if (!iopsLimit) return null
      if (!Number.isFinite(effectiveIops) || effectiveIops <= 0 ||
        effectiveIops < iopsLimit.min || effectiveIops > iopsLimit.max) {
        effectiveIops = getGoogleDiskDefaultIops(type, size)
      }
      if (!Number.isFinite(effectiveIops) || effectiveIops <= 0) return null
      return {
        min: maxInt(140, Math.floor(effectiveIops / 256)),
        max: minInt(2400, Math.floor(effectiveIops / 4)),
      }
    }
    case 'hyperdisk-throughput': {
      if (size < 2048 || size > 32768) return null
      const sizeTiB = size / 1024
      return {
        min: maxInt(20, Math.floor(5 * sizeTiB)),
        max: minInt(Math.floor(90 * sizeTiB), 2400),
      }
    }
    case 'hyperdisk-ml':
      return {
        min: maxInt(400, Math.floor(0.12 * size)),
        max: minInt(2097152, 1600 * size),
      }
    default:
      return null
  }
}
