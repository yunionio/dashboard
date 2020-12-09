import _ from 'lodash'

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
  // 安全组
  secgroups_list: ['compute', 'secgroups', 'list'],
  // 弹性公网IP
  eips_list: ['compute', 'eips', 'list'],
  // 弹性网卡
  networkcard_list: ['compute', 'networkinterfaces', 'list'],
  // 密钥
  keypairs_list: ['compute', 'keypairs', 'list'],
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
  // 负载均衡集群
  lb_loadbalancerclusters_list: ['compute', 'loadbalancerclusters', 'list'],
  // 负载均衡节点
  lb_loadbalanceragents_list: ['compute', 'loadbalanceragents', 'list'],
  // 区域
  areas_list: ['compute', 'cloudregions', 'list'],
  // 区域
  areas_get: ['compute', 'cloudregions', 'get'],
  // 可用区
  zones_list: ['compute', 'zones', 'list'],
  // 服务器
  hosts_list: ['compute', 'hosts', 'list'],
  // 服务器详情
  hosts_get: ['compute', 'hosts', 'get'],
  // 调度标签
  schedtags_list: ['compute', 'schedtags', 'list'],
  // 动态调度标签
  dynamicschedtags_list: ['compute', 'dynamicschedtags', 'list'],
  // 调度策略
  schedpolicies_list: ['compute', 'schedpolicies', 'list'],
  // GPU透传
  isolated_devices_list: ['compute', 'isolated-devices', 'list'],
  // GPU透传详情
  isolated_devices_get: ['compute', 'isolated-devices', 'get'],
  // 路由表
  route_tables_list: ['compute', 'route_tables', 'list'],
  // NAT网关
  natgateways_list: ['compute', 'natgateways', 'list'],
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
  // 域名服务
  dnsrecords_list: ['compute', 'dnsrecords', 'list'],
  // 存储
  storages_list: ['compute', 'storages', 'list'],
  // 对象存储
  buckets_list: ['compute', 'buckets', 'list'],
  // 云账号
  cloudaccounts_list: ['compute', 'cloudaccounts', 'list'],
  // 代理
  proxysettings_list: ['compute', 'proxysettings', 'list'],
  // 域
  domains_list: ['identity', 'domains', 'list'],
  // 域详情
  domains_get: ['identity', 'domains', 'get'],
  // 组
  groups_list: ['identity', 'groups', 'list'],
  // 用户
  users_list: ['identity', 'users', 'list'],
  // 联系方式
  contacts_list: ['notify', 'contacts', 'list'],
  // 项目
  projects_list: ['identity', 'projects', 'list'],
  // 项目详情
  projects_get: ['identity', 'projects', 'get'],
  // 角色
  roles_list: ['identity', 'roles', 'list'],
  // 策略权限
  policies_list: ['identity', 'policies', 'list'],
  // 操作日志
  log_list: ['log', 'log', 'list'],
  // 消息中心
  notifications_list: ['notify', 'notifications', 'list'],
  // 企业信息
  infos_list: ['yunionagent', 'infos', 'list'],
  // 邮件短信
  configs_list: ['notify', 'configs', 'list'],
  // 公告
  notices_list: ['yunionagent', 'notices', 'list'],
  // 私有云套餐
  serverskus_list: ['compute', 'serverskus', 'list'],
  // 认证源
  idps_list: ['identity', 'identity_providers', 'list'],
  // 常用系统(接入端)
  endpoints_list: ['identity', 'endpoints', 'list'],
  // 报警
  commonalerts_list: ['monitor', 'commonalerts', 'list'],
  // 资源消费预警
  costalerts_list: ['meter', 'costalerts', 'list'],
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
  server_perform_syncstatus: ['compute', 'servers', 'perform', 'syncstatus'],
  server_perform_change_owner: ['compute', 'servers', 'perform', 'change-owner'],
  server_perform_deploy: ['compute', 'servers', 'perform', 'deploy'],
  server_perform_save_image: ['compute', 'servers', 'perform', 'save-image'],
  server_perform_insertiso: ['compute', 'servers', 'perform', 'insertiso'],
  server_perform_ejectiso: ['compute', 'servers', 'perform', 'ejectiso'],
  server_perform_add_secgroup: ['compute', 'servers', 'perform', 'add-secgroup'],
  server_perform_revoke_secgroup: ['compute', 'servers', 'perform', 'revoke-secgroup'],
  server_perform_cancel_delete: ['compute', 'servers', 'perform', 'cancel-delete'],
  server_perform_cancel_expire: ['compute', 'servers', 'perform', 'cancel-expire'],
  /**
   * images 相关操作
   */
  images_create: ['image', 'images', 'create'],
  images_update: ['image', 'images', 'update'],
  images_delete: ['image', 'images', 'delete'],
  images_get: ['image', 'images', 'get'],
  images_perform_cancel_delete: ['image', 'images', 'perform', 'cancel-delete'],
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
  /**
   * snapshots 相关操作
   */
  snapshots_create: ['compute', 'snapshots', 'create'],
  snapshots_update: ['compute', 'snapshots', 'update'],
  snapshots_delete: ['compute', 'snapshots', 'delete'],
  snapshots_get: ['compute', 'snapshots', 'get'],
  /**
   * secgroups 相关操作
   */
  secgroups_create: ['compute', 'secgroups', 'create'],
  secgroups_update: ['compute', 'secgroups', 'update'],
  secgroups_delete: ['compute', 'secgroups', 'delete'],
  secgroups_get: ['compute', 'secgroups', 'get'],
  /**
   * secgroups 相关操作
   */
  secgrouprules_create: ['compute', 'secgrouprules', 'create'],
  secgrouprules_update: ['compute', 'secgrouprules', 'update'],
  secgrouprules_delete: ['compute', 'secgrouprules', 'delete'],
  secgrouprules_get: ['compute', 'secgrouprules', 'get'],
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
  /**
   * 负责均衡 相关操作
   */
  lb_loadbalancers_create: ['compute', 'loadbalancers', 'create'],
  lb_loadbalancers_update: ['compute', 'loadbalancers', 'update'],
  lb_loadbalancers_delete: ['compute', 'loadbalancers', 'delete'],
  lb_loadbalancers_get: ['compute', 'loadbalancers', 'get'],
  lb_loadbalancers_perform_status: ['compute', 'loadbalancers', 'perform', 'status'],
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
  /**
   * notices 相关操作
   */
  notices_create: ['yunionagent', 'notices', 'create'],
  notices_update: ['yunionagent', 'notices', 'update'],
  notices_delete: ['yunionagent', 'notices', 'delete'],
  notices_get: ['yunionagent', 'notices', 'get'],
  /**
   * schedtags 相关操作
   */
  schedtags_create: ['compute', 'schedtags', 'create'],
  schedtags_update: ['compute', 'schedtags', 'update'],
  schedtags_delete: ['compute', 'schedtags', 'delete'],
  schedtags_perform_set_scope: ['compute', 'schedtags', 'perform', 'set-scope'],
  schedtags_get: ['compute', 'schedtags', 'get'],
  dynamicschedtags_create: ['compute', 'schedtags', 'create'],
  dynamicschedtags_update: ['compute', 'schedtags', 'update'],
  dynamicschedtags_delete: ['compute', 'schedtags', 'delete'],
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
  externalprojects_update: ['compute', 'externalprojects', 'update'], // 云账号子订阅项目 -> 更改项目
  /**
   * proxysettings 代理操作
   */
  proxysettings_create: ['compute', 'proxysettings', 'create'],
  proxysettings_update: ['compute', 'proxysettings', 'update'],
  proxysettings_delete: ['compute', 'proxysettings', 'delete'],
  /**
   * eips 相关操作
   */
  eips_perform_change_owner: ['compute', 'eips', 'perform', 'change-owner'],
  eips_delete: ['compute', 'eips', 'delete'],
  eips_get: ['compute', 'eips', 'get'],
  eips_create: ['compute', 'eips', 'create'],
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
  /**
   * cloudwatcher 相关操作
   */
  // underutilizedinstances_list: ['monitor', 'underutilizedinstances', 'list'],
  // 工单管理相关操作
  process_manage_list: ['itsm', 'process-definitions', 'list'],
  /**
   * 主机组
   */
  instancegroups_list: ['compute', 'instancegroups', 'list'],
  instancegroups_create: ['compute', 'instancegroups', 'create'],
  /**
   * 数据库-RDS
   */
  rds_dbinstances_list: ['compute', 'dbinstances', 'list'],
  rds_dbinstances_delete: ['compute', 'dbinstances', 'delete'],
  rds_dbinstances_get: ['compute', 'dbinstances', 'get'],
  rds_dbinstances_create: ['compute', 'dbinstances', 'create'],
  /**
   * 数据库-RDS备份列表
   */
  rds_dbinstancebackups_list: ['compute', 'dbinstancebackups', 'list'],
  rds_dbinstancebackups_delete: ['compute', 'dbinstancebackups', 'delete'],
  rds_dbinstancebackups_create: ['compute', 'dbinstancebackups', 'create'],
  /**
   * 数据库-RDS账号
   */
  rds_dbinstanceaccounts_list: ['compute', 'dbinstanceaccounts', 'list'],
  rds_dbinstanceaccounts_delete: ['compute', 'dbinstanceaccounts', 'delete'],
  rds_dbinstanceaccounts_create: ['compute', 'dbinstanceaccounts', 'create'],
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
  /**
   * 数据库-redis账号
   */
  redis_elasticcacheaccounts_list: ['compute', 'elasticcacheaccounts', 'list'],
  redis_elasticcacheaccounts_delete: ['compute', 'elasticcacheaccounts', 'delete'],
  redis_elasticcacheaccounts_create: ['compute', 'elasticcacheaccounts', 'create'],
  /**
   * 数据库-redis白名单
   */
  redis_elasticcacheacls_list: ['compute', 'elasticcacheacls', 'list'],
  redis_elasticcacheacls_delete: ['compute', 'elasticcacheacls', 'delete'],
  redis_elasticcacheacls_create: ['compute', 'elasticcacheacls', 'create'],
  /**
   * 预留IP
   */
  reservedips_create: ['compute', 'reservedips', 'create'],
  reservedips_delete: ['compute', 'reservedips', 'delete'],
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
  // 公有云日志
  cloudevents_list: ['log', 'cloudevents', 'list'],
  // 报警资源
  alertresources_list: ['monitor', 'alertresources', 'list'],
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
  scheduledtasks_list: ['compute', 'scheduledtasks', 'list'],
  scheduledtasks_create: ['compute', 'scheduledtasks', 'create'],
  scheduledtasks_update: ['compute', 'scheduledtasks', 'update'],
  scheduledtasks_delete: ['compute', 'scheduledtasks', 'delete'],
  scheduledtasks_perform_enable: ['compute', 'scheduledtasks', 'perform', 'enable'],
  scheduledtasks_perform_disable: ['compute', 'scheduledtasks', 'perform', 'disable'],
  scheduledtasks_perform_set_label: ['compute', 'scheduledtasks', 'perform', 'set-labels'],
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
  // 权限组缓存
  cloudgroupcache_get: ['cloudid', 'cloudgroupcaches', 'get'],
  cloudgroupcache_delete: ['cloudid', 'cloudgroupcaches', 'delete'],
  // 监控报警
  unifiedmonitors_get: ['monitor', 'unifiedmonitors', 'get'],
  // 报警
  commonalerts_get: ['monitor', 'commonalerts', 'get'],
  commonalerts_create: ['monitor', 'commonalerts', 'create'],
  commonalerts_update: ['monitor', 'commonalerts', 'update'],
  commonalerts_delete: ['monitor', 'commonalerts', 'delete'],
  commonalerts_perform_enable: ['monitor', 'commonalerts', 'perform', 'enable'],
  commonalerts_perform_disable: ['monitor', 'commonalerts', 'perform', 'disable'],
  /** 费用优化 */
  suggestsysalerts_list: ['monitor', 'suggestsysalerts', 'list'],
  suggestsysrules_list: ['monitor', 'suggestsysrules', 'list'],
  suggestsysruleconfigs_list: ['monitor', 'suggestsysrules', 'list'],
  // 资源消费预警
  costalerts_create: ['meter', 'costalerts', 'create'],
  costalerts_delete: ['meter', 'costalerts', 'delete'],

  // DNS解析相关
  dns_zones_get: ['compute', 'dns_zones', 'get'],
  dns_zones_create: ['compute', 'dns_zones', 'create'],
  dns_zones_update: ['compute', 'dns_zones', 'update'],
  dns_zones_delete: ['compute', 'dns_zones', 'delete'],
  dns_zones_add_vpcs: ['compute', 'dns_zones', 'perform', 'add-vpcs'],
  dns_zones_remove_vpcs: ['compute', 'dns_zones', 'perform', 'remove-vpcs'],
  dns_zones_syncstatus: ['compute', 'dns_zones', 'perform', 'syncstatus'],
  dns_zones_sync_recordsets: ['compute', 'dns_zones', 'perform', 'sync-recordsets'],
  dns_zones_change_owner: ['compute', 'dns_zones', 'perform', 'change-owner'],
  dns_recordsets_create: ['compute', 'dns_recordsets', 'create'],
  dns_recordsets_update: ['compute', 'dns_recordsets', 'update'],
  dns_recordsets_get: ['compute', 'dns_recordsets', 'get'],
  dns_recordsets_delete: ['compute', 'dns_recordsets', 'delete'],
  dns_recordsets_disable: ['compute', 'dns_recordsets', 'perform', 'disable'],
  dns_recordsets_enable: ['compute', 'dns_recordsets', 'perform', 'enable'],
  dns_zonecaches_get: ['compute', 'dns_zonecaches', 'get'],
  dns_zonecaches_create: ['compute', 'dns_zonecaches', 'create'],
  dns_zonecaches_delete: ['compute', 'dns_zonecaches', 'delete'],
  // 策略相关
  scopedpolicybindings_delete: ['yunionconf', 'scopedpolicybindings', 'delete'],
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
}

// 已声明权限的资源
export const ALL_RESOURCES = _.uniq(Object.values(PERMISSION).map(item => item[1]))
