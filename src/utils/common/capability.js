
/**
 * 2022-03-16
 * capability
 * }
 */
// 当前列出的非全部参数
// {
//   brands: [],
//   compute_engine_brands: [],
//   rds_engine_brands: [],
//   redis_engine_brands: [],
//   loadbalancer_engine_brands: [],
//   cloud_id_brands: [],
//   saml_auth_brands: [],
//   nat_brands: [],
//   nas_brands: [],
//   waf_brands: [],
//   cdn_brands: [],
//   public_ip_brands: [],
//   network_manage_brands: [],
//   object_storage_brands: [],
//   container_brands: [],

//   disabled_brands: [],
//   disabled_compute_engine_brands: [],
//   disabled_rds_engine_brands: [],
//   disabled_redis_engine_brands: [],
//   disabled_loadbalancer_engine_brands: [],
//   disabled_cloud_id_brands: [],
//   disabled_saml_auth_brands: [],
//   disabled_nat_brands: [],
//   disabled_nas_brands: [],
//   disabled_waf_brands: [],
//   disabled_cdn_brands: [],
//   disabled_public_ip_brands: [],
//   disabled_network_manage_brands: [],
//   disabled_object_storage_brands: [],
//   disabled_container_brands: [],

//   read_only_brands: [],
//   read_only_compute_engine_brands: [],
//   read_only_rds_engine_brands: [],
//   read_only_redis_engine_brands: [],
//   read_only_loadbalancer_engine_brands: [],
//   read_only_cloud_id_brands: [],
//   read_only_saml_auth_brands: [],
//   read_only_nat_brands: [],
//   read_only_nas_brands: [],
//   read_only_waf_brands: [],
//   read_only_cdn_brands: [],
//   read_only_public_ip_brands: [],
//   read_only_network_manage_brands: [],
//   read_only_object_storage_brands: [],
//   read_only_container_brands: [],

//   read_only_disabled_brands: [],
//   read_only_disabled_compute_engine_brands: [],
//   read_only_disabled_rds_engine_brands: [],
//   read_only_disabled_redis_engine_brands: [],
//   read_only_disabled_loadbalancer_engine_brands: [],
//   read_only_disabled_cloud_id_brands: [],
//   read_only_disabled_saml_auth_brands: [],
//   read_only_disabled_nat_brands: [],
//   read_only_disabled_nas_brands: [],
//   read_only_disabled_waf_brands: [],
//   read_only_disabled_cdn_brands: [],
//   read_only_disabled_public_ip_brands: [],
//   read_only_disabled_network_manage_brands: [],
//   read_only_disabled_object_storage_brands: [],
//   read_only_disabled_container_brands: [],
// }

/**
 * 根据capability中某个条件剔除cloudregion
 * @param {Object} capability
 * @param {String} resource 资源类型
 * @param {Array} cloudregionList
 * @param {String} filterKey [read, read_only, read_only_disabled]
 * @return {Array} cloudregionList
 */
export const cloudregionFilterByCapability = ({ capability = {}, resource = '', dataList = [], filterKey = 'read_only', regionKey = 'provider' }) => {
  // 未指明资源类型
  if (!resource) return dataList
  const key = `${filterKey}_${resource}_brands`
  // 未包含要剔除的平台信息
  if (!capability[key] || !capability[key].length) return dataList
  const filterList = capability[key].map(item => item.toLowerCase())
  return dataList.filter(item => {
    const regionBrandKey = (item.provider || item.brand || (regionKey ? item[regionKey] : '')).toLowerCase()
    if (regionBrandKey && filterList.includes(regionBrandKey)) {
      return false
    }
    return true
  })
}
