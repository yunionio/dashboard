export const canIpmiProbe = (bm) => {
  const status = ['running', 'ready', 'init', 'probe_fail']
  if (status.includes(bm.status)) {
    return true
  }
  return false
}
