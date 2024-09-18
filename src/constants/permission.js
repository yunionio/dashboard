import _ from 'lodash'

const requireComponent = require.context('@scope', true, /permission\.(js)$/)
const keys = requireComponent.keys().filter(item => {
  const arr = item.split('/')
  return arr[1] === 'constants' && /\.(js)$/.test(arr[2])
})
let extraPermissions = {}
keys.forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)
  const { PERMISSION = {} } = componentConfig
  extraPermissions = { ...extraPermissions, ...PERMISSION }
})

/**
 * [0] 服务名称
 * [1] 资源名称
 * [2] Action 名称
 * ...
 */
export const PERMISSION = {
  // 计算
  servers_list: ['compute', 'servers', 'list'],
  // 镜像
  images_list: ['image', 'images', 'list'],
  // 主机镜像
  guestimages_list: ['image', 'guestimages', 'list'],
  guestimages_update: ['image', 'guestimages', 'update'],
  guestimages_delete: ['image', 'guestimages', 'delete'],
  guestimages_perform_set_user_metadata: ['image', 'guestimages', 'perform', 'set-user-metadata'],
  guestimages_perform_private: ['image', 'guestimages', 'perform', 'private'],
  guestimages_perform_public: ['image', 'guestimages', 'perform', 'public'],
  guestimages_perform_change_owner: ['image', 'guestimages', 'perform', 'change-ownder'],
  // 硬盘
  disks_list: ['compute', 'disks', 'list'],
  // 快照
  snapshots_list: ['compute', 'snapshots', 'list'],
  // 自动快照策略
  snapshotpolicy_list: ['compute', 'snapshotpolicies', 'list'],
  snapshotpolicy_create: ['compute', 'snapshotpolicies', 'create'],
  snapshotpolicy_delete: ['compute', 'snapshotpolicies', 'delete'],

  // 主机快照
  instance_snapshots_list: ['compute', 'instance_snapshots', 'list'],
  instance_snapshots_delete: ['compute', 'instance_snapshots', 'delete'],
  instance_snapshots_perform_set_user_metadata: ['compute', 'instance_snapshots', 'set-user-metadata'],
  // 安全组
  secgroups_list: ['compute', 'secgroups', 'list'],
  // 弹性公网IP
  eips_list: ['compute', 'eips', 'list'],
  // 弹性网卡
  networkcard_list: ['compute', 'networkinterfaces', 'list'],
  // 密钥
  keypairs_list: ['compute', 'keypairs', 'list'],
  keypairs_perform_public: ['compute', 'keypairs', 'perform', 'public'],
  // 回收站
  recyclebins_list: ['compute', 'recyclebins', 'list'],
  // 集群节点
  k8s_kubemachines_list: ['k8s', 'kubemachines', 'list'],
  // 容器集群
  k8s_kubeclusters_list: ['k8s', 'kubeclusters', 'list'],
  // 容器无状态
  k8s_deployments_list: ['k8s', 'deployments', 'list'],
  // 容器有状态
  k8s_statefulsets_list: ['k8s', 'statefulsets', 'list'],
  // 守护进程
  k8s_daemonsets_list: ['k8s', 'daemonsets', 'list'],
  // 容器任务
  k8s_jobs_list: ['k8s', 'jobs', 'list'],
  // 容器任务
  k8s_cronjobs_list: ['k8s', 'cronjobs', 'list'],
  // 容器组
  k8s_pods_list: ['k8s', 'pods', 'list'],
  // 容器服务
  k8s_services_list: ['k8s', 'k8s_services', 'list'],
  // 容器路由
  k8s_ingresses_list: ['k8s', 'ingresses', 'list'],
  // 容器配置项
  k8s_configmaps_list: ['k8s', 'configmaps', 'list'],
  // 存储声明
  k8s_persistentvolumeclaims_list: ['k8s', 'persistentvolumeclaims', 'list'],
  // 容器字典
  k8s_secrets_list: ['k8s', 'secrets', 'list'],
  // 容器应用市场
  k8s_charts_list: ['k8s', 'charts', 'list'],
  // Helm仓库地址
  k8s_repos_list: ['k8s', 'repos', 'list'],
  // 容器应用编排
  k8s_releases_list: ['k8s', 'releases', 'list'],
  // 集群节点(导入)
  k8s_k8sNode_list: ['k8s', 'k8s_nodes', 'list'],
  // 存储类
  k8s_storageclasses_list: ['k8s', 'storageclasses', 'list'],
  // 命名空间
  k8s_namespace_list: ['k8s', 'namespaces', 'list'],
  // rbacroles
  k8s_rbacroles_list: ['k8s', 'rbacroles', 'list'],
  // rbacrolebindings
  k8s_rbacrolebindings_list: ['k8s', 'rbacrolebindings', 'list'],
  // rbacroles
  k8s_serviceaccounts_list: ['k8s', 'serviceaccounts', 'list'],
  // rbacclusterroles
  k8s_rbacclusterroles_list: ['k8s', 'rbacclusterroles', 'list'],
  // rbacclusterrolebindings
  k8s_rbacclusterrolebindings_list: ['k8s', 'rbacrolebindings', 'list'],
  /* 多集群资源 */
  k8s_federatednamespaces_list: ['k8s', 'federatednamespaces', 'list'],
  k8s_federatedroles_list: ['k8s', 'federatedroles', 'list'],
  k8s_federatedclusterroles_list: ['k8s', 'federatedclusterroles', 'list'],
  k8s_federatedrolebindings_list: ['k8s', 'federatedrolebindings', 'list'],
  k8s_federatedclusterrolebindings_list: ['k8s', 'federatedclusterrolebindings', 'list'],
  // 主机模板
  servertemplates_list: ['compute', 'servertemplates', 'list'],
  // 弹性伸缩组
  scalinggroups_list: ['compute', 'scalinggroups', 'list'],
  // webapp
  webapps_list: ['compute', 'webapps', 'list'],
  webapps_syncstatus: ['compute', 'webapps', 'perform', 'syncstatus'],
  webapps_perform_set_user_metadata: ['compute', 'webapps', 'perform', 'set-user-metadata'],
  // 负载均衡实例管理
  lb_loadbalancers_list: ['compute', 'loadbalancers', 'list'],
  // 负载均衡监听
  lb_loadbalancerlisteners_list: ['compute', 'loadbalancerlisteners', 'list'],
  // 负载均衡服务器组
  lb_loadbalancerbackendgroups_list: ['compute', 'loadbalancerbackendgroups', 'list'],
  // 负载均衡访问控制
  lb_loadbalanceracls_list: ['compute', 'loadbalanceracls', 'list'],
  // 负载均衡证书管理
  lb_loadbalancercertificates_list: ['compute', 'loadbalancercertificates', 'list'],
  lb_loadbalancercertificates_perform_set_user_metadata: ['compute', 'loadbalancercertificates', 'perform', 'set-user-metadata'],
  lb_loadbalancercertificates_change_owner: ['compute', 'loadbalancercertificates', 'perform', 'change-owner'],
  lb_loadbalancercertificates_perform_public: ['compute', 'loadbalancercertificates', 'perform', 'public'],
  // 负载均衡集群
  lb_loadbalancerclusters_list: ['compute', 'loadbalancerclusters', 'list'],
  lb_loadbalancerclusters_delete: ['compute', 'loadbalancerclusters', 'delete'],
  lb_loadbalancerclusters_create: ['compute', 'loadbalancerclusters', 'create'],
  lb_loadbalancerclusters_perform_set_user_metadata: ['compute', 'loadbalancerclusters', 'perform', 'set-user-metadata'],
  // 负载均衡节点
  lb_loadbalanceragents_list: ['compute', 'loadbalanceragents', 'list'],
  lb_loadbalanceragents_create: ['compute', 'loadbalanceragents', 'create'],
  lb_loadbalanceragents_update: ['compute', 'loadbalanceragents', 'update'],
  lb_loadbalanceragents_perform_undeploy: ['compute', 'loadbalanceragents', 'perform', 'undeploy'],
  lb_loadbalanceragents_perform_set_user_metadata: ['compute', 'loadbalanceragents', 'perform', 'set-user-metadata'],
  // ssh 代理节点
  sshproxy_node_list: ['compute', 'proxy_endpoints', 'list'],
  sshproxy_endpoint_delete: ['compute', 'proxy_endpoints', 'delete'],
  sshproxy_endpoint_update: ['compute', 'proxy_endpoints', 'update'],
  sshproxy_endpoint_create: ['compute', 'proxy_endpoints', 'create'],
  sshproxy_match_link: ['compute', 'proxy_matches', 'create'],
  sshproxy_match_unlink: ['compute', 'proxy_matches', 'delete'],
  // ssh 代理节点
  sshproxy_service_list: ['compute', 'proxy_agents', 'list'],
  // 区域
  areas_list: ['compute', 'cloudregions', 'list'],
  // 区域
  areas_get: ['compute', 'cloudregions', 'get'],
  // 可用区
  zones_list: ['compute', 'zones', 'list'],
  // vpc互联
  inter_vpc_networks_list: ['compute', 'inter_vpc_networks', 'list'],
  inter_vpc_networks_perform_syncstatus: ['compute', 'inter_vpc_networks', 'perform', 'syncstatus'],
  inter_vpc_networks_perform_delete: ['compute', 'inter_vpc_networks', 'perform', 'delete'],
  inter_vpc_networks_perform_set_user_metadata: ['compute', 'inter_vpc_networks', 'perform', 'set-user-metadata'],
  inter_vpc_networks_perform_addvpc: ['compute', 'inter_vpc_networks', 'perform', 'addvpc'],
  inter_vpc_networks_perform_removevpc: ['compute', 'inter_vpc_networks', 'perform', 'remotevpc'],

  inter_vpc_network_route_sets_perform_enable: ['compute', 'inter_vpc_network_route_sets', 'perform', 'enable'],
  inter_vpc_network_route_sets_perform_disable: ['compute', 'inter_vpc_network_route_sets', 'perform', 'disable'],
  // vpc对等链接
  vpc_peering_connections_list: ['compute', 'vpc_peering_connections', 'list'],
  vpc_peering_connections_delete: ['compute', 'vpc_peering_connections', 'delete'],
  vpc_peering_connections_perform_syncstatus: ['compute', 'vpc_peering_connections', 'perform', 'syncstatus'],
  vpc_peering_connections_perform_set_user_metadata: ['compute', 'vpc_peering_connections', 'perform', 'set-user-metadata'],
  vpc_peering_connections_create: ['compute', 'vpc_peering_connections', 'create'],
  // 服务器
  hosts_list: ['compute', 'hosts', 'list'],
  hosts_create: ['compute', 'hosts', 'create'],
  hosts_delete: ['compute', 'hosts', 'delete'],
  hosts_update: ['compute', 'hosts', 'update'],
  hosts_perform_start: ['compute', 'hosts', 'perform', 'start'],
  hosts_perform_stop: ['compute', 'hosts', 'perform', 'stop'],
  hosts_perform_reset: ['compute', 'hosts', 'perform', 'reset'],
  hosts_perform_disable: ['compute', 'hosts', 'perform', 'disable'],
  hosts_perform_enable: ['compute', 'hosts', 'perform', 'enable'],
  hosts_perform_syncstatus: ['compute', 'hosts', 'perform', 'syncstatus'],
  hosts_perform_set_schedtag: ['compute', 'hosts', 'perform', 'set-schedtag'],
  hosts_perform_change_owner: ['compute', 'hosts', 'perform', 'change-owner'],
  hosts_perform_public: ['compute', 'hosts', 'perform', 'public'],
  hosts_perform_auto_migrate_on_host_down: ['compute', 'hosts', 'perform', 'auto-migrate-on-host-down'],
  hosts_perform_undo_convert: ['compute', 'hosts', 'perform', 'undo-convert'],
  hosts_perform_maintenance: ['compute', 'hosts', 'perform', 'maintenance'],
  hosts_perform_unmaintenance: ['compute', 'hosts', 'perform', 'unmaintenance'],
  hosts_perform_host_maintenance: ['compute', 'hosts', 'perform', 'host-maintenance'],
  hosts_perform_set_reserved_resource_for_isolated_device: ['compute', 'hosts', 'perform', 'set-reserved-resource-for-isolated-device'],
  hosts_perform_set_user_metadata: ['compute', 'hosts', 'perform', 'set-user-metadata'],
  hosts_perform_convert_hypervisor: ['compute', 'hosts', 'perform', 'convert-hypervisor'],
  hosts_perform_ipmi_probe: ['compute', 'hosts', 'perform', 'ipmi-probe'],
  hosts_perform_prepare: ['compute', 'hosts', 'perform', 'prepare'],
  hosts_get_ipmi: ['compute', 'hosts', 'get', 'ipmi'],
  // 服务器详情
  hosts_get: ['compute', 'hosts', 'get'],
  hosts_perform_login_info: ['compute', 'hosts', 'perform', 'login-info'],

  // 调度策略
  schedpolicies_list: ['compute', 'schedpolicies', 'list'],
  schedpolicies_create: ['compute', 'schedpolicies', 'create'],
  schedpolicies_update: ['compute', 'schedpolicies', 'update'],
  schedpolicies_delete: ['compute', 'schedpolicies', 'delete'],
  // GPU透传
  isolated_devices_list: ['compute', 'isolated_devices', 'list'],
  // GPU透传详情
  isolated_devices_get: ['compute', 'isolated_devices', 'get'],
  isolated_devices_update: ['compute', 'isolated_devices', 'update'],
  // 路由表
  route_tables_list: ['compute', 'route_tables', 'list'],
  route_tables_syncstatus: ['compute', 'route_tables', 'syncstatus'],
  // NAT网关
  natgateways_list: ['compute', 'natgateways', 'list'],
  natgateways_create: ['compute', 'natgateways', 'create'],
  natgateways_update: ['compute', 'natgateways', 'update'],
  natgateways_delete: ['compute', 'natgateways', 'delete'],
  natgateways_perform_set_user_metadata: ['compute', 'natgateways', 'perform', 'set-user-metadata'],
  natgateways_perform_syncstatus: ['compute', 'natgateways', 'perform', 'syncstatus'],
  natgateways_perform_postpaid_expire: ['compute', 'natgateways', 'perform', 'postpaid-expire'],
  natgateways_perform_renew: ['compute', 'natgateways', 'perform', 'renew'],
  natgateways_perform_set_auto_renew: ['compute', 'natgateways', 'perform', 'set-auto-renew'],
  // 虚拟路由器
  wires_list: ['compute', 'wires', 'list'],
  // 虚拟路由器详情
  wires_get: ['compute', 'wires', 'get'],
  // IP子网
  networks_list: ['compute', 'networks', 'list'],
  // VPC
  vpcs_list: ['compute', 'vpcs', 'list'],
  // VPC详情
  vpcs_get: ['compute', 'vpcs', 'get'],
  // 预留IP
  reservedips_list: ['compute', 'reservedips', 'list'],
  reservedips_create: ['compute', 'reservedips', 'create'],
  reservedips_update: ['compute', 'reservedips', 'update'],
  reservedips_delete: ['compute', 'reservedips', 'delete'],
  // 域名服务
  dnsrecords_list: ['compute', 'dnsrecords', 'list'],
  // 存储
  storages_list: ['compute', 'storages', 'list'],
  // 对象存储
  buckets_list: ['compute', 'buckets', 'list'],
  // 云账号
  cloudaccounts_list: ['compute', 'cloudaccounts', 'list'],
  cloudaccounts_perform_project_mapping: ['compute', 'cloudaccounts', 'perform', 'project-mapping'],
  cloudaccounts_perform_associate: ['compute', 'cloudaccounts', 'perform', 'associate'],
  cloudaccounts_perform_dissociate: ['compute', 'cloudaccounts', 'perform', 'dissociate'],
  // 代理
  proxysettings_list: ['compute', 'proxysettings', 'list'],
  // CDN
  cdn_domains_list: ['compute', 'cdn_domains', 'list'],
  cdn_domains_update: ['compute', 'cdn_domains', 'update'],
  cdn_domains_delete: ['compute', 'cdn_domains', 'delete'],
  cdn_domains_perform_syncstatus: ['compute', 'cdn_domains', 'perform', 'syncstatus'],
  cdn_domains_perform_change_owner: ['compute', 'cdn_domains', 'perform', 'change-owner'],
  cdn_domains_perform_set_user_metadata: ['compute', 'cdn_domains', 'perform', 'set-user-metadata'],
  // 域
  domains_list: ['identity', 'domains', 'list'],
  domains_create: ['identity', 'domains', 'create'],
  domains_get: ['identity', 'domains', 'get'],
  domains_delete: ['identity', 'domains', 'delete'],
  domains_perform_enable: ['identity', 'domains', 'perform', 'enable'],
  domains_perform_disable: ['identity', 'domains', 'perform', 'disable'],
  domains_perform_set_user_metadata: ['identity', 'domains', 'perform', 'set-user-metadata'],
  // 组
  groups_list: ['identity', 'groups', 'list'],
  groups_create: ['identity', 'groups', 'create'],
  groups_delete: ['identity', 'groups', 'delete'],
  groups_perform_add_users: ['identity', 'groups', 'perform', 'add-users'],
  groups_perform_remove_users: ['identity', 'groups', 'perform', 'remove-users'],
  // 用户
  users_list: ['identity', 'users', 'list'],
  users_create: ['identity', 'users', 'create'],
  users_update: ['identity', 'users', 'update'],
  users_delete: ['identity', 'users', 'delete'],
  users_perform_enable: ['identity', 'users', 'perform', 'enable'],
  users_perform_disable: ['identity', 'users', 'perform', 'disable'],
  users_perform_join: ['identity', 'users', 'perform', 'join'],
  users_perform_leave: ['identity', 'users', 'perform', 'leave'],
  // 联系方式
  contacts_list: ['notify', 'receivers', 'list'],
  contacts_create: ['notify', 'receivers', 'create'],
  contacts_update: ['notify', 'receivers', 'update'],
  contacts_delete: ['notify', 'receivers', 'delete'],
  contacts_perform_enable: ['notify', 'receivers', 'perform', 'enable'],
  contacts_perform_disable: ['notify', 'receivers', 'perform', 'disable'],
  // 项目
  projects_list: ['identity', 'projects', 'list'],
  projects_get: ['identity', 'projects', 'get'],
  projects_create: ['identity', 'projects', 'create'],
  projects_delete: ['identity', 'projects', 'delete'],
  projects_perform_set_user_metadata: ['identity', 'projects', 'perform', 'set-user-metadata'],
  projects_perform_join: ['identity', 'projects', 'perform', 'join'],
  projects_perform_leave: ['identity', 'projects', 'perform', 'leave'],
  projects_perform_set_admin: ['identity', 'projects', 'perform', 'set-admin'],

  // 角色
  roles_list: ['identity', 'roles', 'list'],
  roles_create: ['identity', 'roles', 'create'],
  roles_delete: ['identity', 'roles', 'delete'],
  roles_perform_public: ['identity', 'roles', 'perform', 'public'],
  roles_perform_set_policies: ['identity', 'roles', 'perform', 'set-policies'],
  // 角色权限
  rolepolicies_delete: ['identity', 'rolepolicies', 'delete'],
  // 策略权限
  policies_list: ['identity', 'policies', 'list'],
  policies_update: ['identity', 'policies', 'update'],
  policies_create: ['identity', 'policies', 'create'],
  policies_delete: ['identity', 'policies', 'delete'],
  policies_perform_public: ['identity', 'policies', 'perform', 'public'],
  // 操作日志
  log_list: ['log', 'actions', 'list'],
  log_manage_list_splitable: ['log', 'actions', 'list', 'splitable'],
  // 命令记录
  commandlogs_list: ['log', 'commandlogs', 'list'],
  // 消息中心
  notifications_list: ['notify', 'notifications', 'list'],
  // 消息订阅
  topics_list: ['notify', 'topics', 'list'],
  topics_perform_enable: ['notify', 'topics', 'perform', 'enable'],
  topics_perform_disable: ['notify', 'topics', 'perform', 'disable'],
  // 通知渠道
  notifyconfigs_list: ['notify', 'notifyconfigs', 'list'],
  notifyconfigs_create: ['notify', 'notifyconfigs', 'create'],
  notifyconfigs_delete: ['notify', 'notifyconfigs', 'delete'],
  // 机器人
  robots_list: ['notify', 'robots', 'list'],
  robots_create: ['notify', 'robots', 'create'],
  robots_update: ['notify', 'robots', 'update'],
  robots_delete: ['notify', 'robots', 'delete'],
  robots_perform_enable: ['notify', 'robots', 'perform', 'enable'],
  robots_perform_disable: ['notify', 'robots', 'perform', 'disable'],
  robots_perform_change_owner: ['notify', 'robots', 'perform', 'change-owner'],
  robots_perform_public: ['notify', 'robots', 'perform', 'public'],
  // 企业信息
  infos_list: ['yunionagent', 'infos', 'list'],
  // 邮件短信
  configs_list: ['notify', 'emailqueues', 'list'],
  // 公告
  notices_list: ['yunionagent', 'notices', 'list'],
  // 私有云套餐
  serverskus_list: ['compute', 'serverskus', 'list'],
  // 认证源
  idps_list: ['identity', 'identity_providers', 'list'],
  idps_create: ['identity', 'identity_providers', 'create'],
  idps_update: ['identity', 'identity_providers', 'update'],
  idps_delete: ['identity', 'identity_providers', 'delete'],
  idps_perform_enable: ['identity', 'identity_providers', 'perform', 'enable'],
  idps_perform_disable: ['identity', 'identity_providers', 'perform', 'disable'],
  idps_perform_sync: ['identity', 'identity_providers', 'perform', 'sync'],
  extra_users_create: ['itsm', 'extra-users', 'create'],
  // 常用系统(接入端)
  endpoints_list: ['identity', 'endpoints', 'list'],
  endpoints_create: ['identity', 'endpoints', 'create'],
  endpoints_delete: ['identity', 'endpoints', 'delete'],
  endpoints_perform_enable: ['identity', 'endpoints', 'perform', 'enable'],
  endpoints_perform_disable: ['identity', 'endpoints', 'perform', 'disable'],
  // 报警
  commonalerts_list: ['monitor', 'commonalerts', 'list'],
  // 资源消费预警
  costalerts_list: ['meter', 'costalerts', 'list'],
  // 巡检
  check_list: ['autoupdate', 'checks', 'list'],
  /**
   * server 相关操作
   */
  server_create: ['compute', 'servers', 'create'],
  server_update: ['compute', 'servers', 'update'],
  server_delete: ['compute', 'servers', 'delete'],
  server_get: ['compute', 'servers', 'get'],
  server_get_vnc: ['compute', 'servers', 'get', 'vnc'],
  server_perform_start: ['compute', 'servers', 'perform', 'start'],
  server_perform_stop: ['compute', 'servers', 'perform', 'stop'],
  server_perform_restart: ['compute', 'servers', 'perform', 'restart'],
  server_perform_rebuild_root: ['compute', 'servers', 'perform', 'rebuild-root'],
  server_perform_change_config: ['compute', 'servers', 'perform', 'change-config'],
  server_perform_set_boot_index: ['compute', 'servers', 'perform', 'set-boot-index'],
  server_perform_syncstatus: ['compute', 'servers', 'perform', 'syncstatus'],
  server_perform_change_owner: ['compute', 'servers', 'perform', 'change-owner'],
  server_perform_deploy: ['compute', 'servers', 'perform', 'deploy'],
  server_perform_set_password: ['compute', 'servers', 'perform', 'set-password'],
  server_perform_save_image: ['compute', 'servers', 'perform', 'save-image'],
  server_perform_insertiso: ['compute', 'servers', 'perform', 'insertiso'],
  server_perform_ejectiso: ['compute', 'servers', 'perform', 'ejectiso'],
  server_perform_add_secgroup: ['compute', 'servers', 'perform', 'add-secgroup'],
  server_perform_revoke_secgroup: ['compute', 'servers', 'perform', 'revoke-secgroup'],
  server_perform_cancel_delete: ['compute', 'servers', 'perform', 'cancel-delete'],
  server_perform_cancel_expire: ['compute', 'servers', 'perform', 'cancel-expire'],
  server_perform_dissociate_eip: ['compute', 'servers', 'perform', 'dissociate-eip'],
  server_perform_reset: ['compute', 'servers', 'perform', 'reset'],
  server_perform_io_throttle: ['compute', 'servers', 'perform', 'io-throttle'],
  server_perform_snapshot_and_clone: ['compute', 'servers', 'perform', 'snapshot-and-clone'],
  server_perform_unbind_groups: ['compute', 'servers', 'perform', 'unbind-groups'],
  server_perform_bind_groups: ['compute', 'servers', 'perform', 'bind-groups'],
  server_perform_create_eip: ['compute', 'servers', 'perform', 'create-eip'],
  server_perform_publicip_to_eip: ['compute', 'servers', 'perform', 'publicip-to-eip'],
  server_perform_modify_src_check: ['compute', 'servers', 'perform', 'modify-src-check'],
  server_perform_create_backup: ['compute', 'servers', 'perform', 'create-backup'],
  server_perform_delete_backup: ['compute', 'servers', 'perform', 'delete-backup'],
  server_perform_migrate: ['compute', 'servers', 'perform', 'migrate'],
  server_perform_live_migrate: ['compute', 'servers', 'perform', 'live-migrate'],
  server_perform_set_user_metadata: ['compute', 'servers', 'perform', 'set-user-metadata'],
  server_perform_suspend: ['compute', 'servers', 'perform', 'suspend'],
  server_perform_resume: ['compute', 'servers', 'perform', 'resume'],
  server_perform_sync_config: ['compute', 'servers', 'perform', 'sync'],
  server_perform_attach_isolated_device: ['compute', 'servers', 'perform', 'attach-isolated-device'],
  server_perform_detach_isolated_device: ['compute', 'servers', 'perform', 'detach-isolated-device'],
  server_perform_set_isolated_device: ['compute', 'servers', 'perform', 'set-isolated-device'],
  server_perform_renew: ['compute', 'servers', 'perform', 'renew'],
  server_perform_aet_auto_renew: ['compute', 'servers', 'perform', 'set-auto-renew'],
  server_perform_setup_ssh_proxy: ['compute', 'servers', 'perform', 'make-sshable'],
  server_perform_detect_ssh_proxy: ['compute', 'servers', 'get', 'sshable'],
  server_perform_install_agent: ['compute', 'servers', 'perform', 'install-agent'],
  server_perform_instance_snapshot_reset: ['compute', 'servers', 'perform', 'instance-snapshot-reset'],
  server_perform_change_bandwidth: ['compute', 'servers', 'perform', 'change-bandwidth'],
  server_perform_change_ipaddr: ['compute', 'servers', 'perform', 'change-ipaddr'],
  server_perform_detachnetwork: ['compute', 'servers', 'perform', 'detachnetwork'],
  server_perform_attachnetwork: ['compute', 'servers', 'perform', 'attachnetwork'],
  server_perform_detach_scaling_group: ['compute', 'servers', 'perform', 'detach-scaling-group'],
  server_perform_instance_backup: ['compute', 'servers', 'perform', 'instance-backup'],
  server_perform_list_forward: ['compute', 'servers', 'perform', 'list-forward'],
  server_perform_open_forward: ['compute', 'servers', 'perform', 'open-forward'],
  server_perform_change_storage: ['compute', 'servers', 'perform', 'change-storage'],
  server_get_jnlp: ['compute', 'servers', 'get', 'jnlp'],
  server_get_cpuset_cores: ['compute', 'servers', 'get', 'cpuset-cores'],
  server_perform_cpuset: ['compute', 'servers', 'perform', 'cpuset'],
  server_perform_make_sshable: ['compute', 'servers', 'perform', 'make-sshable'],
  server_perform_start_rescue: ['compute', 'servers', 'perform', 'start-rescue'],
  server_perform_stop_rescue: ['compute', 'servers', 'perform', 'stop-rescue'],
  /**
   * images 相关操作
   */
  images_create: ['image', 'images', 'create'],
  images_update: ['image', 'images', 'update'],
  images_delete: ['image', 'images', 'delete'],
  images_get: ['image', 'images', 'get'],
  images_perform_cancel_delete: ['image', 'images', 'perform', 'cancel-delete'],
  images_perform_public: ['image', 'images', 'perform', 'public'],
  images_perform_private: ['image', 'images', 'perform', 'private'],
  images_perform_change_owner: ['image', 'images', 'perform', 'change-owner'],
  images_perform_set_user_metadata: ['image', 'images', 'perform', 'set-user-metadata'],
  images_perform_probe: ['image', 'images', 'perform', 'probe'],

  // image cache
  storagecachedimages_delete: ['image', 'storagecachedimages', 'delete'],
  storagecachedimages_create: ['image', 'storagecachedimages', 'create'],
  /**
   * disks 相关操作
   */
  disks_create: ['compute', 'disks', 'create'],
  disks_update: ['compute', 'disks', 'update'],
  disks_delete: ['compute', 'disks', 'delete'],
  disks_get: ['compute', 'disks', 'get'],
  disks_perform_resize: ['compute', 'disks', 'perform', 'resize'],
  disks_perform_attachdisk: ['compute', 'disks', 'perform', 'attachdisk'],
  disks_perform_detachdisk: ['compute', 'disks', 'perform', 'detachdisk'],
  disks_perform_create_snapshot: ['compute', 'disks', 'perform', 'create-snapshot'],
  disks_perform_disk_reset: ['compute', 'disks', 'perform', 'disk-reset'],
  disks_perform_cancel_delete: ['compute', 'disks', 'perform', 'cancel-delete'],
  disks_perform_syncstatus: ['compute', 'disks', 'perform', 'syncstatus'],
  disks_perform_public: ['compute', 'disks', 'perform', 'public'],
  disks_perform_set_user_metadata: ['compute', 'disks', 'perform', 'set-user-metadata'],
  disks_perform_bind_snapshotpolicy: ['compute', 'disks', 'perform', 'bind-snapshotpolicy'],

  /**
   * diskbackups
   */
  diskbackups_list: ['compute', 'diskbackups', 'list'],
  diskbackups_create: ['compute', 'diskbackups', 'create'],
  diskbackups_delete: ['compute', 'diskbackups', 'delete'],
  diskbackups_perform_recovery: ['compute', 'diskbackups', 'perform', 'recovery'],
  diskbackups_perform_syncstatus: ['compute', 'diskbackups', 'perform', 'syncstatus'],
  diskbackups_perform_set_user_metadata: ['compute', 'diskbackups', 'perform', 'set-user-metadata'],

  /**
   * backupstorages
   */
  backupstorages_list: ['compute', 'backupstorages', 'list'],
  backupstorages_create: ['compute', 'backupstorages', 'create'],
  backupstorages_update: ['compute', 'backupstorages', 'update'],
  backupstorages_delete: ['compute', 'backupstorages', 'delete'],
  backupstorages_perform_public: ['compute', 'backupstorages', 'perform', 'public'],
  backupstorages_perform_syncstatus: ['compute', 'backupstorages', 'perform', 'syncstatus'],
  backupstorages_perform_set_user_metadata: ['compute', 'backupstorages', 'perform', 'set-user-metadata'],

  /**
   * snapshots 相关操作
   */
  snapshots_create: ['compute', 'snapshots', 'create'],
  snapshots_update: ['compute', 'snapshots', 'update'],
  snapshots_delete: ['compute', 'snapshots', 'delete'],
  snapshots_get: ['compute', 'snapshots', 'get'],
  snapshots_perform_syncstatus: ['compute', 'snapshots', 'perform', 'syncstatus'],
  snapshots_perform_set_user_metadata: ['compute', 'snapshots', 'perform', 'set-user-metadata'],
  /**
   * secgroups 相关操作
   */
  secgroups_create: ['compute', 'secgroups', 'create'],
  secgroups_update: ['compute', 'secgroups', 'update'],
  secgroups_delete: ['compute', 'secgroups', 'delete'],
  secgroups_get: ['compute', 'secgroups', 'get'],
  secgroups_perform_clone: ['compute', 'secgroups', 'perform', 'clone'],
  secgroups_perform_merge: ['compute', 'secgroups', 'perform', 'merge'],
  secgroups_perform_public: ['compute', 'secgroups', 'perform', 'public'],
  secgroups_perform_add_rules: ['compute', 'secgroups', 'perform', 'add-rules'],
  secgroups_perform_import_rules: ['compute', 'secgroups', 'perform', 'import-rules'],
  secgroups_perform_set_user_metadata: ['compute', 'secgroups', 'perform', 'set-user-metadata'],
  /**
   * secgroups 相关操作
   */
  secgrouprules_create: ['compute', 'secgrouprules', 'create'],
  secgrouprules_update: ['compute', 'secgrouprules', 'update'],
  secgrouprules_delete: ['compute', 'secgrouprules', 'delete'],
  secgrouprules_get: ['compute', 'secgrouprules', 'get'],
  secgrouprules_list: ['compute', 'secgrouprules', 'list'],

  // 报警
  nodealerts_create: ['compute', 'nodealerts', 'create'],
  nodealerts_update: ['compute', 'nodealerts', 'update'],
  nodealerts_delete: ['compute', 'nodealerts', 'delete'],
  /**
   * elasticips 相关操作
   */
  // 'elasticips_create': ['compute', 'elasticips', 'create'],
  // 'elasticips_update': ['compute', 'elasticips', 'update'],
  // 'elasticips_delete': ['compute', 'elasticips', 'delete'],
  // 'elasticips_get': ['compute', 'elasticips', 'get'],
  // 'elasticips_perform_associate': ['compute', 'elasticips', 'perform', 'associate'],
  // 'elasticips_perform_dissociate': ['compute', 'elasticips', 'perform', 'dissociate'],
  // 'elasticips_perform_change_bandwidth': ['compute', 'elasticips', 'perform', 'change-bandwidth'],
  /**
   * keypairs 相关操作
   */
  keypairs_create: ['compute', 'keypairs', 'create'],
  keypairs_update: ['compute', 'keypairs', 'update'],
  keypairs_delete: ['compute', 'keypairs', 'delete'],
  keypairs_get: ['compute', 'keypairs', 'get'],
  /**
   * recyclebins 相关操作
   */
  recyclebins_create: ['compute', 'recyclebins', 'create'],
  recyclebins_update: ['compute', 'recyclebins', 'update'],
  recyclebins_delete: ['compute', 'recyclebins', 'delete'],
  recyclebins_get: ['compute', 'recyclebins', 'get'],
  /**
   * k8s 相关操作
   */
  k8s_deployments_create: ['k8s', 'deployments', 'create'],
  k8s_deployments_update: ['k8s', 'deployments', 'update'],
  k8s_deployments_delete: ['k8s', 'deployments', 'delete'],
  k8s_deployments_get: ['k8s', 'deployments', 'get'],
  k8s_daemonsets_create: ['k8s', 'daemonsets', 'create'],
  k8s_daemonsets_update: ['k8s', 'daemonsets', 'update'],
  k8s_daemonsets_delete: ['k8s', 'daemonsets', 'delete'],
  k8s_daemonsets_get: ['k8s', 'daemonsets', 'get'],
  k8s_statefulsets_create: ['k8s', 'statefulsets', 'create'],
  k8s_statefulsets_update: ['k8s', 'statefulsets', 'update'],
  k8s_statefulsets_delete: ['k8s', 'statefulsets', 'delete'],
  k8s_statefulsets_get: ['k8s', 'statefulsets', 'get'],
  k8s_jobs_create: ['k8s', 'jobs', 'create'],
  k8s_jobs_update: ['k8s', 'jobs', 'update'],
  k8s_jobs_delete: ['k8s', 'jobs', 'delete'],
  k8s_jobs_get: ['k8s', 'jobs', 'get'],
  k8s_cronjobs_create: ['k8s', 'cronjobs', 'create'],
  k8s_cronjobs_update: ['k8s', 'cronjobs', 'update'],
  k8s_cronjobs_delete: ['k8s', 'cronjobs', 'delete'],
  k8s_cronjobs_get: ['k8s', 'cronjobs', 'get'],
  k8s_pods_create: ['k8s', 'pods', 'create'],
  k8s_pods_update: ['k8s', 'pods', 'update'],
  k8s_pods_delete: ['k8s', 'pods', 'delete'],
  k8s_pods_get: ['k8s', 'pods', 'get'],
  k8s_repos_create: ['k8s', 'repos', 'create'],
  k8s_repos_delete: ['k8s', 'repos', 'delete'],
  k8s_repos_update: ['k8s', 'repos', 'update'],
  k8s_repos_perform_public: ['k8s', 'repos', 'perform', 'public'],
  k8s_repos_perform_change_owner: ['k8s', 'repos', 'perform', 'change-owner'],
  k8s_charts_create: ['k8s', 'charts', 'create'],
  k8s_services_create: ['k8s', 'k8s_services', 'create'],
  k8s_services_update: ['k8s', 'k8s_services', 'update'],
  k8s_services_delete: ['k8s', 'k8s_services', 'delete'],
  k8s_services_get: ['k8s', 'k8s_services', 'get'],
  k8s_ingresses_create: ['k8s', 'ingresses', 'create'],
  k8s_ingresses_update: ['k8s', 'ingresses', 'update'],
  k8s_ingresses_delete: ['k8s', 'ingresses', 'delete'],
  k8s_ingresses_get: ['k8s', 'ingresses', 'get'],
  k8s_configmaps_create: ['k8s', 'configmaps', 'create'],
  k8s_configmaps_update: ['k8s', 'configmaps', 'update'],
  k8s_configmaps_delete: ['k8s', 'configmaps', 'delete'],
  k8s_configmaps_get: ['k8s', 'configmaps', 'get'],
  k8s_persistentvolumeclaims_create: ['k8s', 'persistentvolumeclaims', 'create'],
  k8s_persistentvolumeclaims_update: ['k8s', 'persistentvolumeclaims', 'update'],
  k8s_persistentvolumeclaims_delete: ['k8s', 'persistentvolumeclaims', 'delete'],
  k8s_persistentvolumeclaims_get: ['k8s', 'persistentvolumeclaims', 'get'],
  k8s_secrets_create: ['k8s', 'secrets', 'create'],
  k8s_secrets_update: ['k8s', 'secrets', 'update'],
  k8s_secrets_delete: ['k8s', 'secrets', 'delete'],
  k8s_secrets_get: ['k8s', 'secrets', 'get'],
  k8s_releases_create: ['k8s', 'releases', 'create'],
  k8s_releases_update: ['k8s', 'releases', 'update'],
  k8s_releases_delete: ['k8s', 'releases', 'delete'],
  k8s_releases_get: ['k8s', 'releases', 'get'],
  k8s_releases_perform_rollback: ['k8s', 'releases', 'perform', 'rollback'],
  k8s_kubeclusters_create: ['k8s', 'kubeclusters', 'create'],
  k8s_kubeclusters_perform_sync: ['k8s', 'kubeclusters', 'perform', 'sync'],
  k8s_kubeclusters_perform_add_machines: ['k8s', 'kubeclusters', 'perform', 'add-machines'],
  k8s_kubeclusters_get_kubeconfig: ['k8s', 'kubeclusters', 'get', 'kubeconfig'],
  k8s_kubeclusters_delete: ['k8s', 'kubeclusters', 'delete'],
  k8s_nodes_perform_uncordon: ['k8s', 'nodes', 'perform', 'uncordon'],
  k8s_nodes_perform_cordon: ['k8s', 'nodes', 'perform', 'cordon'],
  k8s_nodes_update: ['k8s', 'nodes', 'update'],
  k8s_storageclasses_perform_set_default: ['k8s', 'storageclasses', 'perform', 'set-default'],
  k8s_storageclasses_update: ['k8s', 'storageclasses', 'update'],
  k8s_storageclasses_create: ['k8s', 'storageclasses', 'create'],
  k8s_storageclasses_delete: ['k8s', 'storageclasses', 'delete'],
  k8s_namespaces_update: ['k8s', 'namespaces', 'update'],
  k8s_namespaces_create: ['k8s', 'namespaces', 'create'],
  k8s_namespaces_delete: ['k8s', 'namespaces', 'delete'],
  k8s_rbacroles_create: ['k8s', 'rbacroles', 'create'],
  k8s_rbacroles_update: ['k8s', 'rbacroles', 'update'],
  k8s_rbacroles_delete: ['k8s', 'rbacroles', 'delete'],
  k8s_rbacrolebindings_create: ['k8s', 'rbacrolebindings', 'update'],
  k8s_rbacrolebindings_update: ['k8s', 'rbacrolebindings', 'update'],
  k8s_rbacrolebindings_delete: ['k8s', 'rbacrolebindings', 'delete'],
  k8s_serviceaccounts_update: ['k8s', 'serviceaccounts', 'update'],
  k8s_serviceaccounts_delete: ['k8s', 'serviceaccounts', 'delete'],
  k8s_kubecomponent_update: ['k8s', 'kubecomponent', 'update'],
  k8s_kubecomponent_create: ['k8s', 'kubecomponent', 'create'],
  k8s_kubemachines_delete: ['k8s', 'kubemachines', 'delete'],
  k8s_rbacclusterroles_create: ['k8s', 'rbacclusterroles', 'create'],
  k8s_rbacclusterroles_update: ['k8s', 'rbacclusterroles', 'update'],
  k8s_rbacclusterroles_delete: ['k8s', 'rbacclusterroles', 'delete'],
  k8s_rbacclusterrolebindings_create: ['k8s', 'rbacclusterrolebindings', 'update'],
  k8s_rbacclusterrolebindings_update: ['k8s', 'rbacclusterrolebindings', 'update'],
  k8s_rbacclusterrolebindings_delete: ['k8s', 'rbacclusterrolebindings', 'delete'],
  k8s_federatednamespaces_create: ['k8s', 'federatednamespaces', 'create'],
  k8s_federatednamespaces_delete: ['k8s', 'federatednamespaces', 'delete'],
  k8s_federatednamespaces_perform_attach_cluster: ['k8s', 'federatednamespaces', 'perform', 'attach-cluster'],
  k8s_federatednamespaces_perform_detach_cluster: ['k8s', 'federatednamespaces', 'perform', 'detach-cluster'],
  k8s_federatedroles_create: ['k8s', 'federatedroles', 'create'],
  k8s_federatedroles_delete: ['k8s', 'federatedroles', 'delete'],
  k8s_federatedroles_perform_attach_cluster: ['k8s', 'federatedroles', 'perform', 'attach-cluster'],
  k8s_federatedroles_perform_detach_cluster: ['k8s', 'federatedroles', 'perform', 'detach-cluster'],
  k8s_federatedclusterroles_create: ['k8s', 'federatedclusterroles', 'create'],
  k8s_federatedclusterroles_delete: ['k8s', 'federatedclusterroles', 'delete'],
  k8s_federatedclusterroles_perform_attach_cluster: ['k8s', 'federatedclusterroles', 'perform', 'attach-cluster'],
  k8s_federatedclusterroles_perform_detach_cluster: ['k8s', 'federatedclusterroles', 'perform', 'detach-cluster'],
  k8s_federatedrolebindings_create: ['k8s', 'federatedrolebindings', 'create'],
  k8s_federatedrolebindings_delete: ['k8s', 'federatedrolebindings', 'delete'],
  k8s_federatedrolebindings_perform_attach_cluster: ['k8s', 'federatedrolebindings', 'perform', 'attach-cluster'],
  k8s_federatedrolebindings_perform_detach_cluster: ['k8s', 'federatedrolebindings', 'perform', 'detach-cluster'],
  k8s_federatedclusterrolebindings_create: ['k8s', 'federatedclusterrolebindings', 'create'],
  k8s_federatedclusterrolebindings_delete: ['k8s', 'federatedclusterrolebindings', 'delete'],
  k8s_federatedclusterrolebindings_perform_attach_cluster: ['k8s', 'federatedclusterrolebindings', 'perform', 'attach-cluster'],
  k8s_federatedclusterrolebindings_perform_detach_cluster: ['k8s', 'federatedclusterrolebindings', 'perform', 'detach-cluster'],
  k8s_container_registries_list: ['k8s', 'container_registries', 'list'],
  k8s_container_registries_get: ['k8s', 'container_registries', 'get'],
  k8s_container_registries_create: ['k8s', 'container_registries', 'create'],
  k8s_container_registries_update: ['k8s', 'container_registries', 'update'],
  k8s_container_registries_delete: ['k8s', 'container_registries', 'delete'],
  /**
   * 负责均衡 相关操作
   */
  lb_loadbalancers_perform_enable: ['compute', 'loadbalancers', 'perform', 'enable'],
  lb_loadbalancers_perform_disable: ['compute', 'loadbalancers', 'perform', 'disable'],
  lb_loadbalancers_perform_syncstatus: ['compute', 'loadbalancers', 'perform', 'syncstatus'],
  lb_loadbalancers_perform_set_user_metadata: ['compute', 'loadbalancers', 'perform', 'set-user-metadata'],
  lb_loadbalancers_create: ['compute', 'loadbalancers', 'create'],
  lb_loadbalancers_update: ['compute', 'loadbalancers', 'update'],
  lb_loadbalancers_delete: ['compute', 'loadbalancers', 'delete'],
  lb_loadbalancers_get: ['compute', 'loadbalancers', 'get'],
  lb_loadbalancers_perform_status: ['compute', 'loadbalancers', 'perform', 'status'],
  lb_loadbalancers_perform_associate_eip: ['compute', 'loadbalancers', 'perform', 'associate-eip'],
  lb_loadbalancers_perform_dissociate_eip: ['compute', 'loadbalancers', 'perform', 'dissociate-eip'],
  lb_loadbalancerlisteners_create: ['compute', 'loadbalancerlisteners', 'create'],
  lb_loadbalancerlisteners_update: ['compute', 'loadbalancerlisteners', 'update'],
  lb_loadbalancerlisteners_delete: ['compute', 'loadbalancerlisteners', 'delete'],
  lb_loadbalancerlisteners_get: ['compute', 'loadbalancerlisteners', 'get'],
  lb_loadbalancerlisteners_enable: ['compute', 'loadbalancerlisteners', 'perform', 'enble'],
  lb_loadbalancerlisteners_disable: ['compute', 'loadbalancerlisteners', 'perform', 'disable'],
  lb_loadbalancerlistenerrules_create: ['compute', 'loadbalancerlistenerrules', 'create'],
  lb_loadbalancerlistenerrules_update: ['compute', 'loadbalancerlistenerrules', 'update'],
  lb_loadbalancerlistenerrules_delete: ['compute', 'loadbalancerlistenerrules', 'delete'],
  lb_loadbalancerlistenerrules_get: ['compute', 'loadbalancerlistenerrules', 'get'],
  lb_loadbalancerbackendgroups_create: ['compute', 'loadbalancerbackendgroups', 'create'],
  lb_loadbalancerbackendgroups_update: ['compute', 'loadbalancerbackendgroups', 'update'],
  lb_loadbalancerbackendgroups_delete: ['compute', 'loadbalancerbackendgroups', 'delete'],
  lb_loadbalancerbackendgroups_get: ['compute', 'loadbalancerbackendgroups', 'get'],
  lb_loadbalancerbackends_create: ['compute', 'loadbalancerbackends', 'create'],
  lb_loadbalancerbackends_update: ['compute', 'loadbalancerbackends', 'update'],
  lb_loadbalancerbackends_delete: ['compute', 'loadbalancerbackends', 'delete'],
  lb_loadbalancerbackends_get: ['compute', 'loadbalancerbackends', 'get'],
  lb_loadbalanceracls_create: ['compute', 'loadbalanceracls', 'create'],
  lb_loadbalanceracls_update: ['compute', 'loadbalanceracls', 'update'],
  lb_loadbalanceracls_delete: ['compute', 'loadbalanceracls', 'delete'],
  lb_loadbalanceracls_get: ['compute', 'loadbalanceracls', 'get'],
  lb_loadbalancercertificates_create: ['compute', 'loadbalancercertificates', 'create'],
  lb_loadbalancercertificates_update: ['compute', 'loadbalancercertificates', 'update'],
  lb_loadbalancercertificates_delete: ['compute', 'loadbalancercertificates', 'delete'],
  lb_loadbalancercertificates_get: ['compute', 'loadbalancercertificates', 'get'],

  // 访问控制
  loadbalanceracls_list: ['compute', 'loadbalanceracls', 'list'],
  loadbalanceracls_create: ['compute', 'loadbalanceracls', 'create'],
  loadbalanceracls_update: ['compute', 'loadbalanceracls', 'update'],
  loadbalanceracls_delete: ['compute', 'loadbalanceracls', 'delete'],
  loadbalanceracls_perform_syncstatus: ['compute', 'loadbalanceracls', 'perform', 'syncstatus'],
  loadbalanceracls_perform_change_owner: ['compute', 'loadbalanceracls', 'perform', 'change-owner'],
  loadbalanceracls_perform_public: ['compute', 'loadbalanceracls', 'perform', 'public'],

  /**
   * 主机模板
   */
  servertemplates_create: ['compute', 'servertemplates', 'create'],
  servertemplates_delete: ['compute', 'servertemplates', 'delete'],
  servertemplates_perform_public: ['compute', 'servertemplates', 'perform', 'public'],
  /**
   * 弹性伸缩组
   */
  scalinggroups_create: ['compute', 'scalinggroups', 'create'],
  scalinggroups_delete: ['compute', 'scalinggroups', 'delete'],
  scalinggroups_perform_enable: ['compute', 'scalinggroups', 'perform', 'enable'],
  scalinggroups_perform_disable: ['compute', 'scalinggroups', 'perform', 'disable'],
  /**
   * 弹性伸缩组-伸缩策略
   */
  scalingpolicies_list: ['compute', 'scalingpolicies', 'list'],
  scalingpolicies_create: ['compute', 'scalingpolicies', 'create'],
  scalingpolicies_delete: ['compute', 'scalingpolicies', 'delete'],
  scalingpolicies_perform_enable: ['compute', 'scalingpolicies', 'perform', 'enable'],
  scalingpolicies_perform_disable: ['compute', 'scalingpolicies', 'perform', 'disable'],
  /**
   * cloudregions 相关操作
   */
  cloudregions_get: ['compute', 'cloudregions', 'get'],
  cloudregions_perform_sync_skus: ['compute', 'cloudregions', 'perform', 'sync-skus'],
  /**
   * zones 相关操作
   */
  zones_create: ['compute', 'zones', 'create'],
  zones_update: ['compute', 'zones', 'update'],
  zones_delete: ['compute', 'zones', 'delete'],
  zones_get: ['compute', 'zones', 'get'],
  /**
   * networks 相关操作
   */
  networks_create: ['compute', 'networks', 'create'],
  networks_update: ['compute', 'networks', 'update'],
  networks_delete: ['compute', 'networks', 'delete'],
  networks_get: ['compute', 'networks', 'get'],
  networks_perform_public: ['compute', 'networks', 'perform', 'public'],
  networks_perform_private: ['compute', 'networks', 'perform', 'private'],
  networks_perform_split: ['compute', 'networks', 'perform', 'split'],
  networks_perform_merge: ['compute', 'networks', 'perform', 'merge'],
  networks_perform_change_owner: ['compute', 'networks', 'perform', 'change-owner'],
  networks_perform_syncstatus: ['compute', 'networks', 'perform', 'syncstatus'],
  networks_perform_set_schedtag: ['compute', 'networks', 'perform', 'set-schedtag'],
  networks_perform_set_user_metadata: ['compute', 'networks', 'perform', 'set-user-metadata'],
  networks_perform_switch_wire: ['compute', 'networks', 'perform', 'switch-wire'],
  /**
   * VPC 相关操作
   */
  vpcs_create: ['compute', 'vpcs', 'create'],
  vpcs_update: ['compute', 'vpcs', 'update'],
  vpcs_delete: ['compute', 'vpcs', 'delete'],
  vpcs_perform_change_owner: ['compute', 'vpcs', 'perform', 'change-owner'],
  vpcs_perform_syncstatus: ['compute', 'vpcs', 'perform', 'syncstatus'],
  vpcs_perform_public: ['compute', 'vpcs', 'perform', 'public'],
  vpcs_perform_private: ['compute', 'vpcs', 'perform', 'private'],
  vpcs_perform_set_schedtag: ['compute', 'vpcs', 'perform', 'set-schedtag'],
  vpcs_perform_set_user_metadata: ['compute', 'vpcs', 'perform', 'set-user-metadata'],
  /**
   * 二层网络 相关操作
   */
  wires_create: ['compute', 'wires', 'create'],
  wires_update: ['compute', 'wires', 'update'],
  wires_delete: ['compute', 'wires', 'delete'],
  wires_perform_change_owner: ['compute', 'wires', 'perform', 'change-owner'],
  wires_perform_syncstatus: ['compute', 'wires', 'perform', 'syncstatus'],
  wires_perform_public: ['compute', 'wires', 'perform', 'public'],
  wires_perform_private: ['compute', 'wires', 'perform', 'private'],
  wires_perform_set_schedtag: ['compute', 'wires', 'perform', 'set-schedtag'],
  wires_perform_merge_from: ['compute', 'wires', 'perform', 'merge-from'],
  wires_perform_set_user_metadata: ['compute', 'wires', 'perform', 'set-user-metadata'],
  /**
   * notices 相关操作
   */
  notices_create: ['yunionagent', 'notices', 'create'],
  notices_update: ['yunionagent', 'notices', 'update'],
  notices_delete: ['yunionagent', 'notices', 'delete'],
  notices_get: ['yunionagent', 'notices', 'get'],

  /**
   * 调度标签 schedtags
   */
  schedtags_list: ['compute', 'schedtags', 'list'],
  schedtags_create: ['compute', 'schedtags', 'create'],
  schedtags_update: ['compute', 'schedtags', 'update'],
  schedtags_delete: ['compute', 'schedtags', 'delete'],
  schedtags_perform_set_scope: ['compute', 'schedtags', 'perform', 'set-scope'],
  schedtags_perform_set_resource: ['compute', 'schedtags', 'perform', 'set-resource'],
  schedtags_get: ['compute', 'schedtags', 'get'],

  // 动态调度标签
  dynamicschedtags_list: ['compute', 'dynamicschedtags', 'list'],
  dynamicschedtags_create: ['compute', 'schedtags', 'create'],
  dynamicschedtags_update: ['compute', 'schedtags', 'update'],
  dynamicschedtags_delete: ['compute', 'schedtags', 'delete'],
  schedtags_perform_set_user_metadata: ['compute', 'schedtags', 'perform', 'set-user-metadata'],

  /**
   * storages 相关操作
   */
  storages_create: ['compute', 'storages', 'create'],
  storages_update: ['compute', 'storages', 'update'],
  storages_delete: ['compute', 'storages', 'delete'],
  storages_get: ['compute', 'storages', 'get'],
  storages_perform_enable: ['compute', 'storages', 'perform', 'enable'],
  storages_perform_disable: ['compute', 'storages', 'perform', 'disable'],
  storages_perform_storages: ['compute', 'storages', 'perform', 'storages'],
  storages_perform_change_owner: ['compute', 'storages', 'perform', 'change-owner'],
  storages_perform_public: ['compute', 'storages', 'perform', 'public'],
  storages_perform_set_user_metadata: ['compute', 'storages', 'perform', 'set-user-metadata'],
  storages_update_capacity: ['compute', 'storages', 'perform', 'update-capacity'],

  // 存储桶镜像缓存
  cachedimages_uncache_image: ['compute', 'cachedimages', 'uncache_image'],
  /**
   * buckets 相关操作
   */
  buckets_get: ['compute', 'buckets', 'get'],
  buckets_create: ['compute', 'buckets', 'create'],
  buckets_update: ['compute', 'buckets', 'update'],
  buckets_delete: ['compute', 'buckets', 'delete'],
  buckets_perform_delete: ['compute', 'buckets', 'perform', 'delete'],
  buckets_perform_temp_url: ['compute', 'buckets', 'perform', 'temp-url'],
  buckets_perform_acl: ['compute', 'buckets', 'perform', 'acl'],
  buckets_perform_makedir: ['compute', 'buckets', 'perform', 'makedir'],
  buckets_perform_upload: ['compute', 'buckets', 'perform', 'upload'],
  buckets_perform_change_owner: ['compute', 'buckets', 'perform', 'change_owner'],
  buckets_perform_limit: ['compute', 'buckets', 'perform', 'limit'],
  buckets_perform_syncstatus: ['compute', 'buckets', 'perform', 'syncstatus'],
  buckets_perform_public: ['compute', 'buckets', 'perform', 'public'],
  buckets_perform_set_user_metadata: ['compute', 'buckets', 'perform', 'set-user-metadata'],

  // 跨域规则
  cors_create: ['compute', 'cors', 'create'],
  cors_delete: ['compute', 'cors', 'delete'],

  policy_create: ['compute', 'policy', 'create'],
  policy_delete: ['compute', 'policy', 'delete'],
  /**
   * sku 相关操作
   */
  skus_create: ['compute', 'serverskus', 'create'],
  skus_update: ['compute', 'serverskus', 'update'],
  skus_delete: ['compute', 'serverskus', 'delete'],
  /**
   * cloudaccounts 相关操作
   */
  cloudproviders_list: ['compute', 'cloudproviders', 'list'],
  cloudproviders_get: ['compute', 'cloudproviders', 'get'],
  cloudproviders_create: ['compute', 'cloudproviders', 'create'],
  cloudproviders_delete: ['compute', 'cloudproviders', 'delete'],
  cloudproviders_perform_change_project: ['compute', 'cloudproviders', 'perform', 'change-project'],
  cloudproviders_perform_sync: ['compute', 'cloudproviders', 'perform', 'sync'],
  cloudproviders_perform_enable: ['compute', 'cloudproviders', 'perform', 'enable'],
  cloudproviders_perform_disable: ['compute', 'cloudproviders', 'perform', 'disable'],
  cloudproviderss_perform_project_mapping: ['compute', 'cloudproviders', 'perform', 'project-mapping'],
  /**
   * cloudaccounts 相关操作
   */
  cloudaccounts_create: ['compute', 'cloudaccounts', 'create'],
  cloudaccounts_update: ['compute', 'cloudaccounts', 'update'],
  cloudaccounts_delete: ['compute', 'cloudaccounts', 'delete'],
  cloudaccounts_get: ['compute', 'cloudaccounts', 'get'],
  cloudaccounts_perform_change_project: ['compute', 'cloudaccounts', 'perform', 'change-project'],
  cloudaccounts_perform_sync: ['compute', 'cloudaccounts', 'perform', 'sync'],
  cloudaccounts_perform_enable: ['compute', 'cloudaccounts', 'perform', 'enable'],
  cloudaccounts_perform_disable: ['compute', 'cloudaccounts', 'perform', 'disable'],
  cloudaccounts_perform_update_credential: ['compute', 'cloudaccounts', 'perform', 'update-credential'],
  cloudaccounts_perform_import: ['compute', 'cloudaccounts', 'perform', 'import'],
  cloudaccounts_perform_enable_auto_sync: ['compute', 'cloudaccounts', 'perform', 'enable_auto_sync'],
  cloudaccounts_perform_disable_auto_sync: ['compute', 'cloudaccounts', 'perform', 'disable_auto_sync'],
  cloudaccounts_perform_public: ['compute', 'cloudaccounts', 'perform', 'public'],
  externalprojects_update: ['compute', 'externalprojects', 'update'], // 云账号子订阅项目 -> 更改项目
  externalprojects_create: ['compute', 'externalprojects', 'create'],

  // 免密用户
  samlusers_create: ['compute', 'samlusers', 'create'],
  samlusers_delete: ['compute', 'samlusers', 'delete'],
  /**
   * proxysettings 代理操作
   */
  proxysettings_create: ['compute', 'proxysettings', 'create'],
  proxysettings_update: ['compute', 'proxysettings', 'update'],
  proxysettings_delete: ['compute', 'proxysettings', 'delete'],
  proxysettings_perform_public: ['compute', 'proxysettings', 'perform', 'public'],

  /**
   * projectmappings 同步策略
   */
  projectmappings_create: ['compute', 'projectmappings', 'create'],
  projectmappings_update: ['compute', 'projectmappings', 'update'],
  projectmappings_delete: ['compute', 'projectmappings', 'delete'],
  projectmappings_perform_enable: ['compute', 'projectmappings', 'perform', 'enable'],
  projectmappings_perform_disable: ['compute', 'projectmappings', 'perform', 'disable'],
  /**
   * eips 相关操作
   */
  eips_perform_change_owner: ['compute', 'eips', 'perform', 'change-owner'],
  eips_delete: ['compute', 'eips', 'delete'],
  eips_get: ['compute', 'eips', 'get'],
  eips_create: ['compute', 'eips', 'create'],
  eips_perform_syncstatus: ['compute', 'eips', 'perform', 'syncstatus'],
  eips_perform_set_user_metadata: ['compute', 'eips', 'perform', 'set-user-metadata'],
  eips_perform_change_bandwidth: ['compute', 'eips', 'perform', 'change-bandwidth'],
  /**
   * meter 相关操作
   */
  bill_balances_get: ['meter', 'bill_balances', 'get'],
  bill_balances_list: ['meter', 'bill_balances', 'list'],
  bill_analysises_list: ['meter', 'bill_analysises', 'list'],
  bill_conditions_list: ['meter', 'bill_conditions', 'list'],
  bill_resources_list: ['meter', 'bill_resources', 'list'],
  bill_associates_list: ['meter', 'associate_bills', 'list'],
  bill_details_list: ['meter', 'bill_details', 'list'],
  rates_list: ['meter', 'rates', 'list'],
  rates_update: ['meter', 'rates', 'post'],
  bill_ratesets_list: ['meter', 'ratesets', 'list'],
  bill_ratesets_create: ['meter', 'ratesets', 'create'],
  bill_ratesets_delete: ['meter', 'ratesets', 'delete'],
  bill_exchangerates_list: ['meter', 'exchange_rates', 'list'],
  bill_exchangerates_update: ['meter', 'exchange_rates', 'post'],
  bill_budgets_get: ['meter', 'budgets', 'get'],
  bill_budgets_list: ['meter', 'budgets', 'list'],
  bill_budgets_create: ['meter', 'budgets', 'create'],
  bill_budgets_delete: ['meter', 'budgets', 'delete'],
  bill_budgets_perform: ['meter', 'budgets', 'perform'],
  project_sharings_list: ['meter', 'project_sharings', 'list'],
  project_sharings_create: ['meter', 'project_sharings', 'create'],
  project_sharings_delete: ['meter', 'project_sharings', 'delete'],
  billtasks_list: ['meter', 'billtasks', 'list'],
  billtasks_create: ['meter', 'billtasks', 'create'],

  // 标签
  bill_tags_list: ['meter', 'bill_tags', 'list'],

  // 资源标签
  meter_instances_list: ['meter', 'meter_instances', 'list'],
  meter_instances_get: ['meter', 'meter_instances', 'get'],
  meter_instances_create: ['meter', 'meter_instances', 'create'],
  meter_instances_update: ['meter', 'meter_instances', 'post'],
  meter_instances_delete: ['meter', 'meter_instances', 'delete'],
  meter_instances_perform_change_owner: ['meter', 'meter_instances', 'perform', 'change-owner'],
  meter_instances_perform_set_user_metadata: ['meter', 'meter_instances', 'perform', 'set-user-metadata'],

  /**
   * billsdimensions 维度管理
   */
  billsdimensions_list: ['meter', 'billsdimensions', 'list'],
  billsdimensions_update: ['meter', 'billsdimensions', 'list'],
  billsdimensions_delete: ['meter', 'billsdimensions', 'delete'],
  billsdimensions_perform: ['meter', 'billsdimensions', 'perform'],

  // 二次定价
  cost_conversions_list: ['meter', 'cost_conversions', 'list'],
  cost_conversions_delete: ['meter', 'cost_conversions', 'delete'],
  cost_conversions_create: ['meter', 'cost_conversions', 'create'],

  // 汇率
  billing_exchange_rates_list: ['meter', 'billing_exchange_rates', 'list'],
  billing_exchange_rates_create: ['meter', 'billing_exchange_rates', 'create'],
  billing_exchange_rates_update: ['meter', 'billing_exchange_rates', 'update'],
  billing_exchange_rates_delete: ['meter', 'billing_exchange_rates', 'delete'],

  // 封账
  block_accounts_list: ['meter', 'block_accounts', 'list'],
  block_accounts_create: ['meter', 'block_accounts', 'create'],
  block_accounts_update: ['meter', 'block_accounts', 'update'],

  /**
   * cloudwatcher 相关操作
   */
  // underutilizedinstances_list: ['monitor', 'underutilizedinstances', 'list'],
  // 工单管理相关操作
  process_manage_list: ['itsm', 'process-definitions', 'list'],
  process_manage_update: ['itsm', 'process-definitions', 'update'],
  process_manage_create: ['itsm', 'process-definitions', 'create'],
  /**
   * 主机组
   */
  instancegroups_list: ['compute', 'instancegroups', 'list'],
  instancegroups_create: ['compute', 'instancegroups', 'create'],
  instancegroups_delete: ['compute', 'instancegroups', 'delete'],
  instancegroups_perform_bind_guests: ['compute', 'instancegroups', 'perform', 'bind-guests'],
  instancegroups_perform_enable: ['compute', 'instancegroups', 'perform', 'enable'],
  instancegroups_perform_disable: ['compute', 'instancegroups', 'perform', 'disable'],
  instancegroups_perform_attach_network: ['compute', 'instancegroups', 'perform', 'attachnetwork'],
  instancegroups_perform_detach_network: ['compute', 'instancegroups', 'perform', 'detachnetwork'],

  /**
   * instancebackups
   */
  instancebackups_list: ['compute', 'instancebackups', 'list'],
  instancebackups_create: ['compute', 'instancebackups', 'create'],
  instancebackups_delete: ['compute', 'instancebackups', 'delete'],
  instancebackups_perform_syncstatus: ['compute', 'instancebackups', 'perform', 'syncstatus'],
  instancebackups_perform_recovery: ['compute', 'instancebackups', 'perform', 'recovery'],
  instancebackups_perform_set_user_metadata: ['compute', 'instancebackups', 'perform', 'set-user-metadata'],
  /**
   * 数据库-RDS
   */
  rds_dbinstances_list: ['compute', 'dbinstances', 'list'],
  rds_dbinstances_delete: ['compute', 'dbinstances', 'delete'],
  rds_dbinstances_update: ['compute', 'dbinstances', 'update'],
  rds_dbinstances_get: ['compute', 'dbinstances', 'get'],
  rds_dbinstances_create: ['compute', 'dbinstances', 'create'],
  rds_dbinstances_perform_syncstatus: ['compute', 'dbinstances', 'perform', 'syncstatus'],
  rds_dbinstances_perform_reboot: ['compute', 'dbinstances', 'perform', 'reboot'],
  rds_dbinstances_perform_change_config: ['compute', 'dbinstances', 'perform', 'change-config'],
  rds_dbinstances_perform_change_owner: ['compute', 'dbinstances', 'perform', 'change-owner'],
  rds_dbinstances_perform_postpaid_expire: ['compute', 'dbinstances', 'perform', 'postpaid-expire'],
  rds_dbinstances_perform_renew: ['compute', 'dbinstances', 'perform', 'renew'],
  rds_dbinstances_perform_set_auto_renew: ['compute', 'dbinstances', 'perform', 'set-auto-renew'],
  rds_dbinstances_perform_set_user_metadata: ['compute', 'dbinstances', 'perform', 'set-user-metadata'],
  rds_dbinstances_perform_recovery: ['compute', 'dbinstances', 'perform', 'recovery'],
  /**
   * 数据库-RDS备份列表
   */
  rds_dbinstancebackups_list: ['compute', 'dbinstancebackups', 'list'],
  rds_dbinstancebackups_delete: ['compute', 'dbinstancebackups', 'delete'],
  rds_dbinstancebackups_create: ['compute', 'dbinstancebackups', 'create'],
  rds_dbinstancebackups_perform_syncstatus: ['compute', 'dbinstancebackups', 'perform', 'syncstatus'],
  /**
   * 数据库-RDS账号
   */
  rds_dbinstanceaccounts_list: ['compute', 'dbinstanceaccounts', 'list'],
  rds_dbinstanceaccounts_delete: ['compute', 'dbinstanceaccounts', 'delete'],
  rds_dbinstanceaccounts_create: ['compute', 'dbinstanceaccounts', 'create'],
  rds_dbinstanceaccounts_perform_reset_password: ['compute', 'dbinstanceaccounts', 'perform', 'reset-password'],
  rds_dbinstanceaccounts_perform_set_privileges: ['compute', 'dbinstanceaccounts', 'perform', 'set-privileges'],
  /**
   * 数据库-RDS数据库管理
   */
  rds_dbinstancedatabases_list: ['compute', 'dbinstancedatabases', 'list'],
  rds_dbinstancedatabases_delete: ['compute', 'dbinstancedatabases', 'delete'],
  rds_dbinstancedatabases_create: ['compute', 'dbinstancedatabases', 'create'],
  /**
   * 数据库-redis
   */
  redis_elasticcaches_list: ['compute', 'elasticcaches', 'list'],
  redis_elasticcaches_delete: ['compute', 'elasticcaches', 'delete'],
  redis_elasticcaches_create: ['compute', 'elasticcaches', 'create'],
  redis_elasticcaches_update: ['compute', 'elasticcaches', 'update'],
  redis_elasticcaches_perform_sync: ['compute', 'elasticcaches', 'perform', 'Sync'],
  redis_elasticcaches_perform_restart: ['compute', 'elasticcaches', 'perform', 'restart'],
  redis_elasticcaches_perform_change_spec: ['compute', 'elasticcaches', 'perform', 'change-spec'],
  redis_elasticcaches_perform_flush_instance: ['compute', 'elasticcaches', 'perform', 'flush-instance'],
  redis_elasticcaches_perform_reset_password: ['compute', 'elasticcaches', 'perform', 'reset-password'],
  redis_elasticcaches_perform_change_owner: ['compute', 'elasticcaches', 'perform', 'change-owner'],
  redis_elasticcaches_perform_update_auth_mode: ['compute', 'elasticcaches', 'perform', 'update-auth-mode'],
  redis_elasticcaches_perform_postpaid_expire: ['compute', 'elasticcaches', 'perform', 'postpaid-expire'],
  redis_elasticcaches_perform_renew: ['compute', 'elasticcaches', 'perform', 'renew'],
  redis_elasticcaches_perform_set_auto_renew: ['compute', 'elasticcaches', 'perform', 'set-auto-renew'],
  redis_elasticcaches_perform_set_user_metadata: ['compute', 'elasticcaches', 'perform', 'set-user-metadata'],
  /**
   * 数据库-redis账号
   */
  redis_elasticcacheaccounts_list: ['compute', 'elasticcacheaccounts', 'list'],
  redis_elasticcacheaccounts_delete: ['compute', 'elasticcacheaccounts', 'delete'],
  redis_elasticcacheaccounts_create: ['compute', 'elasticcacheaccounts', 'create'],
  redis_elasticcacheaccounts_perform_reset_password: ['compute', 'elasticcacheaccounts', 'perform', 'reset-password'],

  // redis备份
  redis_elasticcachebackups_create: ['compute', 'elasticcachebackups', 'create'],
  redis_elasticcachebackups_perform_restore_instance: ['compute', 'elasticcachebackups', 'perform', 'restore-instance'],
  /**
   * 数据库-redis白名单
   */
  redis_elasticcacheacls_list: ['compute', 'elasticcacheacls', 'list'],
  redis_elasticcacheacls_delete: ['compute', 'elasticcacheacls', 'delete'],
  redis_elasticcacheacls_create: ['compute', 'elasticcacheacls', 'create'],
  redis_elasticcacheacls_update: ['compute', 'elasticcacheacls', 'update'],

  /**
   * mongodb
   */
  mongodbs_list: ['compute', 'mongodbs', 'list'],
  mongodbs_delete: ['compute', 'mongodbs', 'delete'],
  mongodbs_update: ['compute', 'mongodbs', 'update'],
  mongodbs_perform_delete: ['compute', 'mongodbs', 'perform', 'delete'],
  mongodbs_perform_syncstatus: ['compute', 'mongodbs', 'perform', 'syncstatus'],
  mongodbs_perform_set_user_metadata: ['compute', 'mongodbs', 'perform', 'set-user-metadata'],

  /**
   * 运维工具-模版
   */
  ansible_devtool_templates_list: ['compute', 'devtool_templates', 'list'],
  /**
   * 运维工具-任务
   */
  ansible_ansibleplaybooks_list: ['compute', 'ansibleplaybooks', 'list'],
  /**
   * 网络-全局vpc
   */
  network_globalvpcs_list: ['compute', 'globalvpcs', 'list'],
  network_globalvpcs_create: ['compute', 'globalvpcs', 'create'],
  network_globalvpcs_delete: ['compute', 'globalvpcs', 'delete'],
  network_globalvpcs_perform_set_schedtag: ['compute', 'globalvpcs', 'perform', 'set-schedtag'],
  network_globalvpcs_perform_change_owner: ['compute', 'globalvpcs', 'perform', 'change-owner'],
  network_globalvpcs_perform_public: ['compute', 'globalvpcs', 'perform', 'public'],
  network_globalvpcs_perform_syncstatus: ['compute', 'globalvpcs', 'perform', 'syncstatus'],
  network_globalvpcs_perform_set_user_metadata: ['compute', 'globalvpcs', 'perform', 'set-user-metadata'],
  // 公有云日志
  cloudevents_list: ['cloudevent', 'cloudevents', 'list'],
  // 报警资源
  alertresources_list: ['monitor', 'alertresources', 'list'],
  // 报警记录
  alertrecords_list: ['monitor', 'alertrecords', 'list'],
  // 屏蔽告警
  alertrecordshields_list: ['monitor', 'alertrecordshields', 'list'],
  alertrecordshields_create: ['monitor', 'alertrecordshields', 'create'],
  // 未恢复告警
  monitorresourcealerts_list: ['monitor', 'monitorresourcealerts', 'list'],
  /**
   * 配额更新
   */
  quota_create: ['compute', 'quotas', 'create'],
  quota_delete: ['compute', 'quotas', 'delete'],
  quota_update: ['compute', 'quotas', 'update'],
  quota_list: ['compute', 'quotas', 'list'],
  project_quota_create: ['compute', 'project_quotas', 'create'],
  project_quota_delete: ['compute', 'project_quotas', 'delete'],
  project_quota_update: ['compute', 'project_quotas', 'update'],
  project_quota_list: ['compute', 'project_quotas', 'list'],
  region_quota_create: ['compute', 'region_quotas', 'create'],
  region_quota_delete: ['compute', 'region_quotas', 'delete'],
  region_quota_update: ['compute', 'region_quotas', 'update'],
  region_quota_list: ['compute', 'region_quotas', 'list'],
  zone_quota_create: ['compute', 'zone_quotas', 'create'],
  zone_quota_delete: ['compute', 'zone_quotas', 'delete'],
  zone_quota_update: ['compute', 'zone_quotas', 'update'],
  zone_quota_list: ['compute', 'zone_quotas', 'list'],
  image_quota_create: ['image', 'image_quotas', 'create'],
  image_quota_delete: ['image', 'image_quotas', 'delete'],
  image_quota_update: ['image', 'image_quotas', 'update'],
  image_quota_list: ['image', 'image_quotas', 'list'],
  domain_quota_create: ['compute', 'domain_quotas', 'create'],
  domain_quota_delete: ['compute', 'domain_quotas', 'delete'],
  domain_quota_update: ['compute', 'domain_quotas', 'update'],
  domain_quota_list: ['compute', 'domain_quotas', 'list'],
  identity_quota_create: ['identity', 'identity_quotas', 'create'],
  identity_quota_delete: ['identity', 'identity_quotas', 'delete'],
  identity_quota_update: ['identity', 'identity_quotas', 'update'],
  identity_quota_list: ['identity', 'identity_quotas', 'list'],
  infras_quota_create: ['compute', 'infras_quotas', 'create'],
  infras_quota_delete: ['compute', 'infras_quotas', 'delete'],
  infras_quota_update: ['compute', 'infras_quotas', 'update'],
  infras_quota_list: ['compute', 'infras_quotas', 'list'],
  /**
   * 策略
   */
  policydefinitions_list: ['compute', 'policydefinitions', 'list'],
  // 权限
  policies_get: ['identity', 'policies', 'get'],
  // 定时任务
  scheduledtasks_list: ['scheduledtask', 'scheduledtasks', 'list'],
  scheduledtasks_create: ['scheduledtask', 'scheduledtasks', 'create'],
  scheduledtasks_update: ['scheduledtask', 'scheduledtasks', 'update'],
  scheduledtasks_delete: ['scheduledtask', 'scheduledtasks', 'delete'],
  scheduledtasks_perform_enable: ['scheduledtask', 'scheduledtasks', 'perform', 'enable'],
  scheduledtasks_perform_disable: ['scheduledtask', 'scheduledtasks', 'perform', 'disable'],
  scheduledtasks_perform_set_label: ['scheduledtask', 'scheduledtasks', 'perform', 'set-labels'],
  // 权限组
  cloudgroup_create: ['cloudid', 'cloudgroups', 'create'],
  cloudgroup_list: ['cloudid', 'cloudgroups', 'list'],
  cloudgroup_get: ['cloudid', 'cloudgroups', 'get'],
  cloudgroup_perform_add_user: ['cloudid', 'cloudgroups', 'perform', 'add-user'],
  cloudgroup_perform_set_policy: ['cloudid', 'cloudgroups', 'perform', 'set-policies'],
  cloudgroup_delete: ['cloudid', 'cloudgroups', 'delete'],
  cloudgroup_perform_remove_user: ['cloudid', 'cloudgroups', 'perform', 'remove-user'],
  cloudgroup_perform_syncstatus: ['cloudid', 'cloudgroups', 'perform', 'syncstatus'],
  // 云用户
  clouduser_perform_leave_group: ['cloudid', 'cloudusers', 'perform', 'leave-group'],
  // 云权限
  cloudpolicy_list: ['cloudid', 'cloudpolicies', 'list'],
  cloudpolicy_perform_revoke_group: ['cloudid', 'cloudpolicies', 'perform', 'revoke-group'],
  // 云用户
  clouduser_list: ['cloudid', 'cloudusers', 'list'],
  clouduser_get: ['cloudid', 'cloudusers', 'get'],
  clouduser_create: ['cloudid', 'cloudusers', 'create'],
  clouduser_update: ['cloudid', 'cloudusers', 'update'],
  clouduser_delete: ['cloudid', 'cloudusers', 'delete'],
  clouduser_perform_change_owner: ['cloudid', 'cloudusers', 'perform', 'change-owner'],
  clouduser_perform_set_groups: ['cloudid', 'cloudusers', 'perform', 'set-groups'],
  clouduser_perform_syncstatus: ['cloudid', 'cloudusers', 'perform', 'syncstatus'],
  // 监控报警
  unifiedmonitors_get: ['monitor', 'unifiedmonitors', 'get'],
  // 监控资源
  monitorresources_list: ['monitor', 'monitorresources', 'list'],
  monitorresources_get: ['monitor', 'monitorresources', 'get'],
  monitorresources_delete: ['monitor', 'monitorresources', 'delete'],
  // 报警
  commonalerts_get: ['monitor', 'commonalerts', 'get'],
  commonalerts_create: ['monitor', 'commonalerts', 'create'],
  commonalerts_update: ['monitor', 'commonalerts', 'update'],
  commonalerts_delete: ['monitor', 'commonalerts', 'delete'],
  commonalerts_perform_enable: ['monitor', 'commonalerts', 'perform', 'enable'],
  commonalerts_perform_disable: ['monitor', 'commonalerts', 'perform', 'disable'],
  /** 费用优化 */
  suggestsysruleconfigs_list: ['suggestion', 'suggestsysruleconfigs', 'list'],
  suggestsysruleconfigs_delete: ['suggestion', 'suggestsysruleconfigs', 'delete'],
  suggestsysrules_list: ['suggestion', 'suggestsysrules', 'list'],
  suggestsysrules_update: ['suggestion', 'suggestsysrules', 'update'],
  suggestsysrules_perform_enable: ['suggestion', 'suggestsysrules', 'perform', 'enable'],
  suggestsysrules_perform_disable: ['suggestion', 'suggestsysrules', 'perform', 'disable'],
  suggestsysalerts_list: ['suggestion', 'suggestsysalerts', 'list'],
  suggestsysalerts_delete: ['suggestion', 'suggestsysalerts', 'delete'],
  suggestsysalerts_perform_ignore: ['suggestion', 'suggestsysalerts', 'perform', 'ignore'],
  // 资源消费预警
  costalerts_create: ['meter', 'costalerts', 'create'],
  costalerts_delete: ['meter', 'costalerts', 'delete'],

  // DNS解析相关
  dns_zones_list: ['compute', 'dns_zones', 'list'],
  dns_zones_get: ['compute', 'dns_zones', 'get'],
  dns_zones_create: ['compute', 'dns_zones', 'create'],
  dns_zones_update: ['compute', 'dns_zones', 'update'],
  dns_zones_delete: ['compute', 'dns_zones', 'delete'],
  dns_zones_add_vpcs: ['compute', 'dns_zones', 'perform', 'add-vpcs'],
  dns_zones_remove_vpcs: ['compute', 'dns_zones', 'perform', 'remove-vpcs'],
  dns_zones_syncstatus: ['compute', 'dns_zones', 'perform', 'syncstatus'],
  dns_zones_sync_recordsets: ['compute', 'dns_zones', 'perform', 'sync-recordsets'],
  dns_zones_change_owner: ['compute', 'dns_zones', 'perform', 'change-owner'],
  dns_zones_perform_set_user_metadata: ['compute', 'dns_zones', 'perform', 'set-user-metadata'],
  dns_recordsets_create: ['compute', 'dns_recordsets', 'create'],
  dns_recordsets_update: ['compute', 'dns_recordsets', 'update'],
  dns_recordsets_get: ['compute', 'dns_recordsets', 'get'],
  dns_recordsets_delete: ['compute', 'dns_recordsets', 'delete'],
  dns_recordsets_disable: ['compute', 'dns_recordsets', 'perform', 'disable'],
  dns_recordsets_enable: ['compute', 'dns_recordsets', 'perform', 'enable'],
  dns_recordsets_perform_set_user_metadata: ['compute', 'dns_recordsets', 'perform', 'set-user-metadata'],
  // 策略相关
  scopedpolicybindings_delete: ['yunionconf', 'scopedpolicybindings', 'delete'],
  scopedpolicybindings_list: ['yunionconf', 'scopedpolicybindings', 'list'],
  scopedpolicybindings_create: ['yunionconf', 'scopedpolicybindings', 'create'],
  scopedpolicies_list: ['yunionconf', 'scopedpolicies', 'list'],
  scopedpolicies_create: ['yunionconf', 'scopedpolicies', 'create'],
  scopedpolicies_update: ['yunionconf', 'scopedpolicies', 'update'],
  scopedpolicies_delete: ['yunionconf', 'scopedpolicies', 'delete'],
  // 主机磁盘
  guestdisks_list: ['compute', 'guestdisks', 'list'],
  // 主机网卡
  guestnetworks_list: ['compute', 'guestnetworks', 'list'],
  // 主机安全组
  guestsecgroups_list: ['compute', 'guestsecgroups', 'list'],
  // 主机弹性伸缩组
  scalinggroupguests_list: ['compute', 'scalinggroupguests', 'list'],
  // 宿主机网络
  baremetalnetworks_list: ['compute', 'baremetalnetworks', 'list'],
  // 宿主机存储
  hoststorages_list: ['compute', 'hoststorages', 'list'],
  // 宿主机二层网络
  hostwires_list: ['compute', 'hostwires', 'list'],

  // NAS权限组
  access_groups_list: ['compute', 'access_groups', 'list'],
  access_groups_create: ['compute', 'access_groups', 'create'],
  access_groups_delete: ['compute', 'access_groups', 'delete'],
  access_groups_set_user_metadata: ['compute', 'access_groups', 'perform', 'set-user-metadata'],
  access_groups_perform_syncstatus: ['compute', 'access_groups', 'perform', 'syncstatus'],

  // NAS权限组规则
  access_group_rules_list: ['compute', 'access_group_rules', 'list'],
  access_group_rules_create: ['compute', 'access_group_rules', 'create'],
  access_group_rules_delete: ['compute', 'access_group_rules', 'delete'],
  access_group_rules_update: ['compute', 'access_group_rules', 'update'],

  // 文件系统
  file_systems_list: ['compute', 'file_systems', 'list'],
  file_systems_create: ['compute', 'file_systems', 'create'],
  file_systems_delete: ['compute', 'file_systems', 'delete'],
  file_systems_update: ['compute', 'file_systems', 'update'],
  file_systems_perform_syncstatus: ['compute', 'file_systems', 'perform', 'syncstatus'],
  file_systems_perform_set_user_metadata: ['compute', 'file_systems', 'perform', 'set-user-metadata'],

  // 挂载点
  mount_targets_list: ['compute', 'mount_targets', 'list'],
  mount_targets_create: ['compute', 'mount_targets', 'create'],
  mount_targets_delete: ['compute', 'mount_targets', 'delete'],
  mount_targets_perform_syncstatus: ['compute', 'mount_targets', 'perform', 'syncstatus'],

  // 消息订阅接收人
  topics_disable: ['notify', 'topics', 'perform', 'disable'],
  topics_enable: ['notify', 'topics', 'perform', 'enable'],
  subscribers_update: ['notify', 'subscribers', 'update'],
  subscribers_create: ['notify', 'subscribers', 'get'],
  subscribers_delete: ['notify', 'subscribers', 'delete'],
  subscribers_disable: ['notify', 'subscribers', 'perform', 'disable'],
  subscribers_enable: ['notify', 'subscribers', 'perform', 'enable'],

  // waf策略
  waf_instances_list: ['compute', 'waf_instances', 'list'],
  waf_instances_syncstatus: ['compute', 'waf_instances', 'perform', 'syncstatus'],
  waf_instances_delete: ['compute', 'waf_instances', 'delete'],
  waf_instances_perform_set_user_metadata: ['compute', 'waf_instances', 'perform', 'set-user-metadata'],

  elastic_search_delete: ['compute', 'elastic_searchs', 'delete'],
  elastic_search_set_user_metadata: ['compute', 'elastic_searchs', 'perform', 'set-user-metadata'],
  // kafka
  kafkas_list: ['compute', 'kafkas', 'list'],
  kafkas_update: ['compute', 'kafkas', 'update'],
  kafkas_delete: ['compute', 'kafkas', 'delete'],
  kafkas_perform_syncstatus: ['compute', 'kafkas', 'perform', 'syncstatus'],
  kafkas_set_user_metadata: ['compute', 'kafkas', 'perform', 'set-user-metadata'],
  // elastic_search
  elastic_searchs_list: ['compute', 'elastic_searchs', 'list'],
  elastic_searchs_update: ['compute', 'elastic_searchs', 'update'],
  elastic_searchs_delete: ['compute', 'elastic_searchs', 'delete'],
  elastic_searchs_perform_syncstatus: ['compute', 'elastic_searchs', 'perform', 'syncstatus'],
  elastic_searchs_perform_set_user_metadata: ['compute', 'elastic_searchs', 'perform', 'set-user-metadata'],
  // 全局设置
  services_get: ['common', 'services', 'get'],
  // 字典配置
  dictionary_get: ['yunionconf', 'parameters', 'get'],

  //
  prices_perform_discount: ['meter', 'prices', 'perform', 'discount'],

  tapservices_list: ['compute', 'tap_services', 'list'],
  tapservices_perform_enabled: ['compute', 'tap_services', 'perform', 'enabled'],
  tapservices_perform_disabled: ['compute', 'tap_services', 'perform', 'disabled'],
  tapservices_delete: ['compute', 'tap_services', 'delete'],
  tapservices_create: ['compute', 'tap_services', 'create'],

  tapflows_list: ['compute', 'tap_flows', 'list'],
  tapflows_perform_enabled: ['compute', 'tap_flows', 'perform', 'enabled'],
  tapflows_perform_disabled: ['compute', 'tap_flows', 'perform', 'disabled'],
  tapflows_delete: ['compute', 'tap_flows', 'delete'],
  tapflows_create: ['compute', 'tap_flows', 'create'],

  tablestores_list: ['compute', 'tablestores', 'list'],

  shieldbills_list: ['meter', 'shield_bills', 'list'],
  shieldbills_create: ['meter', 'shield_bills', 'create'],
  shieldbills_delete: ['meter', 'shield_bills', 'delete'],

  // 报表
  report_settings_list: ['report', 'report_settings', 'list'],
  report_settings_create: ['report', 'report_settings', 'create'],
  report_settings_delete: ['report', 'report_settings', 'delete'],
  report_settings_perform_add_elements: ['report', 'report_settings', 'perform', 'add-elements'],
  report_settings_perform_generate_report: ['report', 'report_settings', 'perform', 'generate_report'],

  report_elements_list: ['report', 'report_elements', 'list'],
  report_elements_create: ['report', 'report_elements', 'create'],
  report_elements_delete: ['report', 'report_elements', 'delete'],

  // 透传设备类型
  isolated_device_models_list: ['compute', 'isolated_device_models', 'list'],
  isolated_device_models_get: ['compute', 'isolated_device_models', 'get'],
  isolated_device_models_create: ['compute', 'isolated_device_models', 'create'],
  isolated_device_models_update: ['compute', 'isolated_device_models', 'update'],
  isolated_device_models_delete: ['compute', 'isolated_device_models', 'delete'],

  // ipv6网关
  ipv6_gateways_list: ['compute', 'ipv6_gateways', 'list'],
  ipv6_gateways_get: ['compute', 'ipv6_gateways', 'get'],
  ipv6_gateways_create: ['compute', 'ipv6_gateways', 'create'],
  ipv6_gateways_update: ['compute', 'ipv6_gateways', 'update'],
  ipv6_gateways_delete: ['compute', 'ipv6_gateways', 'delete'],

  // ModelArts
  modelarts_list: ['compute', 'modelarts_pools', 'list'],
  modelarts_get: ['compute', 'modelarts_pools', 'get'],
  modelarts_create: ['compute', 'modelarts_pools', 'create'],
  modelarts_update: ['compute', 'modelarts_pools', 'update'],
  modelarts_delete: ['compute', 'modelarts_pools', 'delete'],
  modelarts_perform_syncstatus: ['compute', 'modelarts_pools', 'perform', 'syncstatus'],
  modelarts_perform_change_owner: ['compute', 'modelarts_pools', 'perform', 'change-owner'],

  // 报表
  irs_reports_list: ['report', 'reports', 'list'],
  irs_reports_get: ['report', 'reports', 'get'],

  month_reports_list: ['report', 'month_reports', 'list'],
  month_reports_update: ['report', 'month_reports', 'update'],
  month_reports_perform_enabled: ['report', 'month_reports', 'perform', 'enabled'],
  month_reports_perform_disabled: ['report', 'month_reports', 'perform', 'disabled'],
  daily_reports_list: ['report', 'daily_reports', 'list'],

  organizations_list: ['identity', 'organizations', 'list'],
  organizations_create: ['identity', 'organizations', 'create'],
  organizations_update: ['identity', 'organizations', 'update'],
  organizations_delete: ['identity', 'organizations', 'delete'],
  organizations_perform_bind: ['identity', 'organizations', 'perform', 'bind'],

  compute_usages_list: ['compute', 'usages', 'list'],
  compute_usages_get: ['compute', 'usages', 'get'],
  image_usages_list: ['image', 'usages', 'list'],
  image_usages_get: ['image', 'usages', 'get'],
  identity_usages_list: ['identity', 'usages', 'list'],
  identity_usages_get: ['identity', 'usages', 'get'],

  bill_predictions_query: ['meter', 'predictions', 'perform', 'query'],

  // 异常消费
  bill_alert_settings_list: ['meter', 'bill_alert_settings', 'list'],
  bill_alert_settings_get: ['meter', 'bill_alert_settings', 'get'],
  bill_alert_settings_update: ['meter', 'bill_alert_settings', 'update'],
  bill_alert_settings_delete: ['meter', 'bill_alert_settings', 'delete'],
  bill_alert_settings_perform_enabled: ['meter', 'bill_alert_settings', 'perform', 'enabled'],
  bill_alert_settings_perform_disabled: ['meter', 'bill_alert_settings', 'perform', 'disabled'],
  bill_alerts_list: ['meter', 'bill_alerts', 'list'],

  bastion_hosts_list: ['bastionhost', 'bastion_hosts', 'list'],
  bastion_hosts_get: ['bastionhost', 'bastion_hosts', 'get'],
  bastion_hosts_create: ['bastionhost', 'bastion_hosts', 'create'],
  bastion_hosts_update: ['bastionhost', 'bastion_hosts', 'update'],
  bastion_hosts_delete: ['bastionhost', 'bastion_hosts', 'delete'],

  bastion_servers_create: ['bastionhost', 'bastion_servers', 'create'],

  // 自定义数据
  ext_resources_list: ['extdb', 'ext_resources', 'list'],
  ext_resources_update: ['extdb', 'ext_resources', 'update'],
  ext_resources_create: ['extdb', 'ext_resources', 'create'],
  ext_resources_delete: ['extdb', 'ext_resources', 'delete'],

  ext_resource_types_list: ['extdb', 'ext_resource_types', 'list'],
  ext_resource_types_create: ['extdb', 'ext_resource_types', 'create'],
  ext_resource_types_delete: ['extdb', 'ext_resource_types', 'delete'],
  ext_resource_types_perform_set_attributes: ['extdb', 'ext_resource_types', 'perform', 'set-attributes'],
  ext_resource_types_perform_enable: ['extdb', 'ext_resource_types', 'perform', 'enable'],
  ext_resource_types_perform_disable: ['extdb', 'ext_resource_types', 'perform', 'disable'],

  scirptapplys_list: ['devtool', 'scirptapplys', 'list'],
  scirptapplys_update: ['devtool', 'scirptapplys', 'update'],
  scirptapplys_create: ['devtool', 'scirptapplys', 'create'],
  scirptapplys_delete: ['devtool', 'scirptapplys', 'delete'],
  scriptapplyrecords_list: ['devtool', 'scriptapplyrecords', 'list'],
  scriptapplyrecords_update: ['devtool', 'scriptapplyrecords', 'update'],
  scriptapplyrecords_create: ['devtool', 'scriptapplyrecords', 'create'],
  scriptapplyrecords_delete: ['devtool', 'scriptapplyrecords', 'delete'],

  ...extraPermissions,
}

// 已声明权限的资源
export const ALL_RESOURCES = _.uniq(Object.values(PERMISSION).map(item => item[1]))
