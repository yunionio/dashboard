export const getBranch = () => {
  const { head } = window.buildInfo.scope
  const r = head.split('heads/')
  return r[r.length - 1]
}
