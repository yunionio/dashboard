/**
 * 裸金属创建：工单回填辅助（非整表草稿）
 */
export function resolveDraftLoginType (initData) {
  const fromExtra = initData?.extraData?.loginType
  if (fromExtra) return fromExtra
  if (initData?.keypair) return 'keypair'
  if (initData && Object.prototype.hasOwnProperty.call(initData, 'reset_password') && !initData.reset_password) {
    return 'image'
  }
  if (initData && Object.prototype.hasOwnProperty.call(initData, 'password') && initData.password) {
    return 'password'
  }
  return 'random'
}
