export function maskSecret (val) {
  if (!val) return '-'
  const s = String(val)
  if (s.length <= 8) return '****'
  return `${s.slice(0, 4)}****${s.slice(-4)}`
}

export function copyText (vm, text) {
  if (!text) return
  vm.$copyText(text)
  vm.$message.success(vm.$t('common.copy'))
}
