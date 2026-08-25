import { addRiscvUsageMessages, HOST_CPU_ARCHS, resolveHostCpuArch } from '@/constants/computeArch'

describe('RISC-V architecture support', () => {
  it('exposes riscv64 in shared architecture options', () => {
    expect(HOST_CPU_ARCHS.riscv64).toEqual({
      key: 'riscv64',
      label: 'riscv64',
      capabilityKey: 'riscv64',
      order: 4,
    })
  })

  it.each([
    ['amd64', HOST_CPU_ARCHS.x86],
    ['i386', HOST_CPU_ARCHS.x86],
    ['x86', HOST_CPU_ARCHS.x86],
    ['riscv', HOST_CPU_ARCHS.riscv64],
    ['riscv32', HOST_CPU_ARCHS.riscv64],
    ['riscv64', HOST_CPU_ARCHS.riscv64],
    ['x86_64', HOST_CPU_ARCHS.x86],
    ['arm', HOST_CPU_ARCHS.arm],
    ['arm32', HOST_CPU_ARCHS.arm],
    ['arm64', HOST_CPU_ARCHS.arm],
    ['aarch64', HOST_CPU_ARCHS.arm],
    ['loong64', HOST_CPU_ARCHS.loongarch64],
    ['loongarch64', HOST_CPU_ARCHS.loongarch64],
    ['RISCV64', HOST_CPU_ARCHS.riscv64],
  ])('normalizes %s to its UI architecture option', (value, expected) => {
    expect(resolveHostCpuArch(value)).toBe(expected)
  })

  it.each([undefined, null, '', 'mips64'])('leaves unsupported architecture %p unresolved', value => {
    expect(resolveHostCpuArch(value)).toBeUndefined()
  })

  it('adds RISC-V usage labels without assuming every value is a string', () => {
    const messages = {
      'all.servers.x86_64': 'Number of Servers (x86)',
      'all.servers.x86_64.meta': { unit: 'count' },
      'all.servers.aarch64': 'Number of Servers (ARM)',
    }

    expect(addRiscvUsageMessages(messages, 'RISC-V 64-bit')).toEqual({
      ...messages,
      'all.servers.riscv64': 'Number of Servers (RISC-V 64-bit)',
    })
    expect(messages['all.servers.riscv64.meta']).toBeUndefined()
  })
})
