export const HOST_CPU_ARCHS = {
  x86: {
    key: 'x86',
    label: 'x86_64',
    capabilityKey: 'x86_64',
    order: 1,
  },
  arm: {
    key: 'arm',
    label: 'aarch64',
    capabilityKey: 'aarch64',
    order: 2,
  },
  loongarch64: {
    key: 'loongarch64',
    label: 'loongarch64',
    capabilityKey: 'loongarch64',
    order: 3,
  },
  riscv64: {
    key: 'riscv64',
    label: 'riscv64',
    capabilityKey: 'riscv64',
    order: 4,
  },
}

export const resolveHostCpuArch = (arch) => {
  const value = String(arch || '').toLowerCase()
  if (!value) return undefined
  if (value === 'amd64' || value === 'i386' || value.startsWith('x86')) {
    return HOST_CPU_ARCHS.x86
  }
  if (value.startsWith('arm') || value.startsWith('aarch')) {
    return HOST_CPU_ARCHS.arm
  }
  if (value.startsWith('riscv')) {
    return HOST_CPU_ARCHS.riscv64
  }
  if (value === 'loong64' || value === HOST_CPU_ARCHS.loongarch64.key) {
    return HOST_CPU_ARCHS.loongarch64
  }
  return undefined
}

export const addRiscvUsageMessages = (usageMessages, label) => {
  Object.keys(usageMessages).forEach(key => {
    const value = usageMessages[key]
    if (key.includes('.x86_64') && typeof value === 'string') {
      usageMessages[key.replace('.x86_64', '.riscv64')] = value.replace(/x86/g, label)
    }
  })
  return usageMessages
}
