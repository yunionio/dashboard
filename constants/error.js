/* eslint-disable */

/**
 * 格式如下
'CLASS': {
  'zh-CN': 'XXX',
  'details': {
    'ID': {
      'zh-CN': {
        <Message>
        'message': 'XXX',
        <如需对fields的值进行翻译>
        'fields': {
          'cloud-ssh': '高效云硬盘'
        }
      }
    }
  }
}
 */


export default {
  "InputParameterError": {
    "zh-CN": "输入参数有误，请修改后重试",
    "details": {
      "Hypervisor {0} not supported": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的虚拟化类型 {0}"
        }
      },
      "invalid ip address: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 错误"
        }
      },
      "Invalid range header": {
        "zh-CN": {
          "fields": {},
          "message": "数据取值不合法，请查看取值范围，修正后重试"
        }
      },
      "Unsupported scheme {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的加密类型 {0}"
        }
      },
      "invalid any_mac address": {
        "zh-CN": {
          "fields": {},
          "message": "获取MAC地址失败"
        }
      },
      "Address {0} not in range": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 不在IP子网范围之内"
        }
      },
      "Split IP {0} is the start ip": {
        "zh-CN": {
          "fields": {},
          "message": "IP {0} 是分割子网的起始地址"
        }
      },
      "invalid aggregate_strategy: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "无效的调度标签 {0} ，请修正后重试。"
        }
      },
      "Cannot create disk with disabled storage[{0}]": {
        "zh-CN": {
          "fields": {},
          "message": "不能创建磁盘，因为对应的存储 {0} 离线或被禁止，请更换存储重试或联系管理员查看存储的状态"
        }
      },
      "Cannot modify memory for baremetal": {
        "zh-CN": {
          "fields": {},
          "message": "不能更改裸金属服务器的内存大小"
        }
      },
      "address {0} is not in the range of network {1}({2})": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 无效，请输入IP子网 {1}({2}) 内的地址"
        }
      },
      "baremetal_disk_config.{0}": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘配置错误 {0} ，请修正后重试。"
        }
      },
      "not a valid ip address {0}: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的IP地址 {0}: {1}"
        }
      },
      "Empty import disks": {
        "zh-CN": {
          "fields": {},
          "message": "导入磁盘数量为0"
        }
      },
      "Cannot set default strategy of {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能设置默认的调度标签策略 {0}"
        }
      },
      "parse isolated device description error {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的独立设备描述字段: {0}"
        }
      },
      "missong duration": {
        "zh-CN": {
          "fields": {},
          "message": "缺失范围段"
        }
      },
      "cannot associate eip and instance in different provider": {
        "zh-CN": {
          "fields": {},
          "message": "弹性公网IP和虚拟机要在相同的账号、平台、区域下"
        }
      },
      "Server {0} already exists": {
        "zh-CN": {
          "fields": {},
          "message": "名称 {0} 重复，请更正后重试"
        }
      },
      "Bandwidth limit cannot exceed {0}Mbps": {
        "zh-CN": {
          "fields": {},
          "message": "带宽不能超过 {0} Mbps，请修正后重试"
        }
      },
      "empty condition": {
        "zh-CN": {
          "fields": {},
          "message": "缺少参数，请修正后重试"
        }
      },
      "duplicate route cidr {0}": {
        "zh-CN": {
          "fields": {},
          "message": "与路由网段 {0} 冲突"
        }
      },
      "eip and server are not in the same region": {
        "zh-CN": {
          "fields": {},
          "message": "弹性公网IP和云服务器不在同一个地区"
        }
      },
      "Invalid masklen {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的IP地址掩码长度 {0}"
        }
      },
      "Disk {0} not belong the guest's host": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘 {0} 不归属于云服务器所在的宿主机"
        }
      },
      "Invalid bandwidth": {
        "zh-CN": {
          "fields": {},
          "message": "带宽无效，请修正后重试"
        }
      },
      "cannot associate eip and instance in different region": {
        "zh-CN": {
          "fields": {},
          "message": "不能关联弹性公网IP到不同地区的云服务器"
        }
      },
      "parse cdrom device info error {0}": {
        "zh-CN": {
          "fields": {},
          "message": "光盘设备参数 {0} 异常"
        }
      },
      "cannot run hypervisor {0} on specified host with type {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {1} 类型的宿主机上运行云服务器 {0}"
        }
      },
      "name is too short": {
        "zh-CN": {
          "fields": {},
          "message": "名称太短，请修正后重试"
        }
      },
      "Not enough free space": {
        "zh-CN": {
          "fields": {},
          "message": "没有足够的磁盘空间，请增加磁盘或释放一些空间"
        }
      },
      "charge type {0} not supported": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的计费类型: {0}"
        }
      },
      "server region is not found???": {
        "zh-CN": {
          "fields": {},
          "message": "云服务器的地区没有找到???"
        }
      },
      "server and eip are not managed by the same provider": {
        "zh-CN": {
          "fields": {},
          "message": "弹性公网IP和云服务器不属于同一个账号"
        }
      },
      "comment contains non-printable char: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "说明信息含有不可打印字符: {0}"
        }
      },
      "Image name is required": {
        "zh-CN": {
          "fields": {},
          "message": "镜像名称为空，请输入镜像明细"
        }
      },
      "{0}: bad base64 encoded string: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 base64 字符串 {0}, 错误信息: {1}"
        }
      },
      "name starts with letter, and contains letter, number and ._@- only": {
        "zh-CN": {
          "fields": {},
          "message": "名称以字母开头，可包含字母，数字和._ @"
        }
      },
      "invalid vrrp authentication pass size: {0}, want [1,8]": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 vrrp 认证密码长度, 长度需要在 1~8 范围内 "
        }
      },
      "Cannot revoke security rules in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在虚拟机状态为 {0} 时取消关联安全组"
        }
      },
      "invalid input format": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的输入格式"
        }
      },
      "Parse spec key {0} error: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 spec_key {0} 错误信息: {1}"
        }
      },
      "invalid storage_id {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 storage_id 参数 {0}"
        }
      },
      "acl cidr duplicate {0}": {
        "zh-CN": {
          "fields": {},
          "message": "访问控制地址段 {0} 冲突"
        }
      },
      "Missing secgrp.0 secgrp.1 ... parameters": {
        "zh-CN": {
          "fields": {},
          "message": "缺少类似于 secgrp.0 secgrp.1 ... 这样的参数"
        }
      },
      "CPU core count must be 1 ~ {0}": {
        "zh-CN": {
          "fields": {},
          "message": "CPU大小必须在 1 ~ {0} 范围内"
        }
      },
      "CPU core count must be integer": {
        "zh-CN": {
          "fields": {},
          "message": "CPU大小必须是整数"
        }
      },
      "failed to find secgroup {0} for params {1}": {
        "zh-CN": {
          "fields": {},
          "message": "没有根据参数 {1} 找到安全组 {0}"
        }
      },
      "{0}: Invalid IP address {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的IP地址 {1} 来自于参数 {0}"
        }
      },
      "Cannot create disk with offline storage[{0}]": {
        "zh-CN": {
          "fields": {},
          "message": "不能在存储 {0} 离线状态下创建磁盘"
        }
      },
      "invalid condition": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的条件"
        }
      },
      "No disk information provided": {
        "zh-CN": {
          "fields": {},
          "message": "缺少磁盘信息"
        }
      },
      "invalid duration {0}: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的时间区间: {0} 错误信息: {1}"
        }
      },
      "unsupported duration {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的时间间隔: {0}"
        }
      },
      "Conflict address space with existing networks": {
        "zh-CN": {
          "fields": {},
          "message": "地址段与先用的网络冲突"
        }
      },
      "candidate {0} out of range": {
        "zh-CN": {
          "fields": {},
          "message": "候选IP {0} 不在子网范围内"
        }
      },
      "Invalid IP {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的IP: {0}"
        }
      },
      "Missing name or generate_name": {
        "zh-CN": {
          "fields": {},
          "message": "缺少 name 或 generate_name 参数"
        }
      },
      "comment too long ({0}>={1})": {
        "zh-CN": {
          "fields": {},
          "message": "说明内容太长, 当前长度 {0} 限制长度 {1}"
        }
      },
      "{0}: bad template: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "模板 {0} 异常: {1}"
        }
      },
      "Storage[{0}] must attach to a host": {
        "zh-CN": {
          "fields": {},
          "message": "存储 {0} 必须挂载到一个主机上"
        }
      },
      "Address {0} not in network": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 不在任何子网内"
        }
      },
      "invalid public": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的公钥"
        }
      },
      "Invalid start ip: {0} {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的起始地址 {0} {1}"
        }
      },
      "Address {0} has been used": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 已经被使用"
        }
      },
      "eip region is not found???": {
        "zh-CN": {
          "fields": {},
          "message": "弹性公网IP未找到对应的地区???"
        }
      },
      "Cannot reduce disk size": {
        "zh-CN": {
          "fields": {},
          "message": "不能缩减磁盘大小"
        }
      },
      "cpu_core_count should not be empty": {
        "zh-CN": {
          "fields": {},
          "message": "参数 cpu_core_count 应该为空"
        }
      },
      "Memory size must be 8MB ~ {0} GB": {
        "zh-CN": {
          "fields": {},
          "message": "内存大小必须在 8M 到 {0}GB 之间"
        }
      },
      "invalid bandwidth": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的带宽"
        }
      },
      "invalid vrrp interface {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的vrrp接口 {0}"
        }
      },
      "loadbalancerlistenerrule {0}({1}): fetching listener {2} failed": {
        "zh-CN": {
          "fields": {},
          "message": "负载均衡监听规则 {0}({1}) 匹配监听 {2} 失败"
        }
      },
      "address {0} is already occupied": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 已经被使用"
        }
      },
      "invalid cidr_block {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 cidr_block 参数 {0}"
        }
      },
      "Invalid root image: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "系统镜像不可用，请更换镜像后重试"
        }
      },
      "Disk {0} and guest not belong to the same zone": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘 {0} 和虚机不在同一可用区内"
        }
      },
      "Network not in range of VPC cidrblock {0}": {
        "zh-CN": {
          "fields": {},
          "message": "子网不在VPC网段 {0} 内"
        }
      },
      "backend group {0}({1}) belongs to loadbalancer {2}, not {3}": {
        "zh-CN": {
          "fields": {},
          "message": "后端服务器组 {0}({1}) 属于负载均衡 {2}, 而不是 {3}"
        }
      },
      "security group {0} has already been assigned to guest {1}": {
        "zh-CN": {
          "fields": {},
          "message": "安全组 {0} 已经绑定了虚拟机 {1}"
        }
      },
      "Malformed domain configuration {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的域名配置 {0}"
        }
      },
      "Cannot keep detached disk": {
        "zh-CN": {
          "fields": {},
          "message": "不能保留卸载过的磁盘"
        }
      },
      "Invalid storage type {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的存储类型 {0}"
        }
      },
      "cannot support change azure disk name": {
        "zh-CN": {
          "fields": {},
          "message": "不支持更改微软云磁盘名称"
        }
      },
      "Host {0} is not a baremetal": {
        "zh-CN": {
          "fields": {},
          "message": "主机 {0} 不是一个裸金属服务器"
        }
      },
      "invalid end ip: {0} {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的最后一个IP {0} {1}"
        }
      },
      "not allow update azure tenant info": {
        "zh-CN": {
          "fields": {},
          "message": "不允许更新微软云账号的项目字段"
        }
      },
      "Cannot assign security rules in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在虚机状态为 {0} 时关联安全组"
        }
      },
      "invalid format": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的格式"
        }
      },
      "Address been assigned out of new range": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址已经在其他地方被使用"
        }
      },
      "Empty record": {
        "zh-CN": {
          "fields": {},
          "message": "空的记录"
        }
      },
      "Reserved ip to release must be provided": {
        "zh-CN": {
          "fields": {},
          "message": "必须提供被释放的保留IP"
        }
      },
      "invalid input {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的输入 {0}"
        }
      },
      "Disk in {0} not able to attach": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘在 {0} 状态下不能挂载"
        }
      },
      "Diskinfo not contains either imageID or size": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘信息内没有包含镜像或者大小信息"
        }
      },
      "Server Name is empty": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机名称为空"
        }
      },
      "security group id should not be empty": {
        "zh-CN": {
          "fields": {},
          "message": "安全组ID不能为空"
        }
      },
      "No root image": {
        "zh-CN": {
          "fields": {},
          "message": "未找到镜像信息"
        }
      },
      "invalid strategy {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的调度策略 {0}"
        }
      },
      "UnSupport priority range, only support 1-100": {
        "zh-CN": {
          "fields": {},
          "message": "规则优先级必须在 1-100之间"
        }
      },
      "Invalid name {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的名称 {0}"
        }
      },
      "Address {0} not reserved": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 没有被保留"
        }
      },
      "Duplicate name {0}": {
        "zh-CN": {
          "fields": {},
          "message": "名称 {0} 冲突"
        }
      },
      "cannot support more than 1 nic": {
        "zh-CN": {
          "fields": {},
          "message": "仅支持一个网卡"
        }
      },
      "Unsupported provider {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的公有云 {0}"
        }
      },
      "The secgroup name {0} does not meet the requirements, please change the name": {
        "zh-CN": {
          "fields": {},
          "message": "安全组名称不符合规则，请先更改安全组规则"
        }
      },
      "No either wire or vpc provided": {
        "zh-CN": {
          "fields": {},
          "message": "未提供二层网络或专有网络VPC信息"
        }
      },
      "name longer than {0}": {
        "zh-CN": {
          "fields": {},
          "message": "名称长度超过了 {0}"
        }
      },
      "invalid ttl: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 ttl {0}"
        }
      },
      "server host is not found???": {
        "zh-CN": {
          "fields": {},
          "message": "未找到服务器所属的主机？？？"
        }
      },
      "{0}: time error: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "时间信息 {0} 错误 {1}"
        }
      },
      "Disk {0} has been attached": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘 {0} 已经被挂载"
        }
      },
      "Root disk must have templete": {
        "zh-CN": {
          "fields": {},
          "message": "系统盘必须有镜像信息"
        }
      },
      "instance_type_category {0} is invalid": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的实例簇 {0}"
        }
      },
      "both reserved ip and notes should be provided": {
        "zh-CN": {
          "fields": {},
          "message": "保留ip及说明都必须提供"
        }
      },
      "input data not key value dict": {
        "zh-CN": {
          "fields": {},
          "message": "提供的键值对必须是字典"
        }
      },
      "body is not a json?": {
        "zh-CN": {
          "fields": {},
          "message": "参数不是json串？"
        }
      },
      "Zone id {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "可用区ID {0} 没有找到"
        }
      },
      "Memory size must be number[+unit], like 256M, 1G or 256": {
        "zh-CN": {
          "fields": {},
          "message": "内存大小必须是数字或者数字[+单位], 例如 256M, 1G 或 256"
        }
      },
      "Empty import nics": {
        "zh-CN": {
          "fields": {},
          "message": "导入的网卡信息为空"
        }
      },
      "invalid aggregate_strategy": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的聚合调度标签"
        }
      },
      "invalid addr {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的地址 {0}"
        }
      },
      "Split IP {0} out of range": {
        "zh-CN": {
          "fields": {},
          "message": "分割的IP不在子网内"
        }
      },
      "Invalid default stragegy {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的默认调度标签 {0}"
        }
      },
      "not support update disk_type {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不支持更新磁盘类型 {0}"
        }
      },
      "Invalid Target Network: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的目标网络 {0}"
        }
      },
      "invalid cdrom device description {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的光盘设备描述信息 {0}"
        }
      },
      "Storage type[{0}] not match backend {1}": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘的后端存储 {1} 未匹配存储 {0}"
        }
      },
      "backend group {0}({1}) belongs to loadbalancer {2} instead of {3}": {
        "zh-CN": {
          "fields": {},
          "message": "后端服务器组 {0}({1}) 属于负载均衡 {2} 而不是 {3}"
        }
      },
      "cannot support change azure instance name": {
        "zh-CN": {
          "fields": {},
          "message": "不允许更改微软云虚机的名称"
        }
      },
      "Empty spec query key": {
        "zh-CN": {
          "fields": {},
          "message": "缺少 spec_key 参数"
        }
      },
      "invalid cloud account info": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的云账号信息"
        }
      },
      "Invalid medium type {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的介质类型 {0}"
        }
      },
      "Invalid capacity": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的容量信息"
        }
      },
      "Cannot save image in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在虚机状态为 {0} 时保存镜像"
        }
      },
      "invalid disk description {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的磁盘信息 {0}"
        }
      },
      "Security Group {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "安全组 {0} 未找到"
        }
      },
      "invalid access_mac address": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 access_mac 信息"
        }
      },
      "Root disk must be present": {
        "zh-CN": {
          "fields": {},
          "message": "系统盘信息必须存在"
        }
      },
      "Guest {0} not support attach disk in status {1}": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机 {0} 在 {1} 状态下不能挂载磁盘"
        }
      },
      "Invalid desc: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的参数: {0}"
        }
      },
      "Invalid driver: {0}, ONLY ldap is supported": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的类别 {0}, 仅支持 ldap"
        }
      },
      "parse disk description error {0}": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘信息错误 {0}"
        }
      },
      "unmarshaling cidrs failed: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "解析网段信息错误 {0}"
        }
      },
      "Disk {0} and guest not belong to the same account": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘 {0} 和虚拟机不属于同一个账号"
        }
      },
      "DISK Index {0} has been occupied": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘位置 {0} 已经被占用"
        }
      },
      "security group {0} not assigned to guest {1}": {
        "zh-CN": {
          "fields": {},
          "message": "安全组 {0} 未绑定在虚拟机 {0} 上"
        }
      },
      "{0}: new time is in the future: {1} > {2}": {
        "zh-CN": {
          "fields": {},
          "message": "{0}: 不能超过当前时间 {1} > {2}"
        }
      },
      "telegraf params: invalid influxdb url: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 influxdb 地址 {0}"
        }
      },
      "Server Id is empty": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机ID为空"
        }
      },
      "cloud provider/manager must be provided": {
        "zh-CN": {
          "fields": {},
          "message": "缺少 provider 或者 manager参数"
        }
      },
      "invalid cert pubkey algorithm: {0}, want {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的证书签名算法 {0}, 需要为 {1}"
        }
      },
      "memory_size_mb should not be empty": {
        "zh-CN": {
          "fields": {},
          "message": "参数 memory_size_mb 为空"
        }
      },
      "Unsupported {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的虚机类型 {0}"
        }
      },
      "parse network description error {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的网络描述信息: {0}"
        }
      },
      "Invalid server_type: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的虚拟机类型 {0}"
        }
      },
      "invalid duration {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的时间间隔 {0}"
        }
      },
      "no valid vpc ???": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的专有网络VPC???"
        }
      },
      "invalid vrrp priority {0}: want [1,255]": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 vrrp 优先级 {0}: 范围取值 [1,255]"
        }
      },
      "ip_prefix error: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "网段错误: {0}"
        }
      },
      "invalid vrrp virtual_router_id {0}: want [1,255]": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的 vrrp virtual_router_id 参数 {0}, 取值范围 [1,255]"
        }
      },
      "No controlplane nodes": {
        "zh-CN": {
          "fields": {},
          "message": "需要添加【控制节点】"
        }
      },
      "wrong captcha": {
        "zh-CN": {
          "fields": {},
          "message": "验证码错误"
        }
      },
      "user_name: must be in a valid format.": {
        "zh-CN": {
          "fields": {},
          "message": "用户名格式不正确"
        }
      },
    }
  },
  "SpecNotFoundError": {
    "zh-CN": "部分值为空，请核查后重试",
    "details": {
      "{0} {1} {2} not found": {
        "zh-CN": {
          "fields": {},
          "message": "{0} {1} {2} 未找到"
        }
      }
    }
  },
  "DuplicateNameError": {
    "zh-CN": "名称重复，请尝试其他名称",
    "details": {
      "paramter {0} has been created": {
        "zh-CN": {
          "fields": {},
          "message": "配置 {0} 已经创建过了"
        }
      },
      "name": {
        "zh-CN": {
          "fields": {},
          "message": "名称冲突"
        }
      },
      "image name": {
        "zh-CN": {
          "fields": {},
          "message": "镜像名称冲突"
        }
      }
    }
  },
  "NotFoundError": {
    "zh-CN": "输入参数有误，请核查后重试",
    "details": {
      "failed to find SecurityGroup {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未找到安全组 {0}"
        }
      },
      "wire {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到二层网络 {0}"
        }
      },
      "Guest disk {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机磁盘 {0} 未找到"
        }
      },
      "failed to find {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未找到 {0}"
        }
      },
      "failed to find host for storage {0} with disk {1}": {
        "zh-CN": {
          "fields": {},
          "message": "未能通过磁盘 {1} 所在的存储 {0} 找到对应的主机信息"
        }
      },
      "image {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "镜像 {0} 未找到"
        }
      },
      "manager {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "账号 {0} 未找到"
        }
      },
      "Snapshot {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "快照 {0} 未找到"
        }
      },
      "policy {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "访问策略 {0} 未找到"
        }
      },
      "failed to find storage for disk {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未能通过磁盘 {0} 找到存储信息"
        }
      },
      "Security Group {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "安全组 {0} 未找到"
        }
      },
      "Vpc {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "专有网络VPC {0} 未找到"
        }
      },
      "Can not get disk snapshot": {
        "zh-CN": {
          "fields": {},
          "message": "未能找到磁盘底下的快照"
        }
      },
      "Not found cluster {0} kubeconfig": {
        "zh-CN": {
          "fields": {},
          "message": "未能找到集群 {0} 的kubeconfig"
        }
      },
      "VPC {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "专有网络VPC {0} 未找到"
        }
      },
      "wire not found for zone {0} and vpc {1}": {
        "zh-CN": {
          "fields": {},
          "message": "未能找到可用区 {0} 及专有网络VPC {0} 的二层网络"
        }
      },
      "Region {0} not found: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "区域 {0} 未找到: {1}"
        }
      },
      "Disk not found": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘未找到"
        }
      },
      "Project {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "项目 {0} 未找到"
        }
      },
      "Schedtag {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "调度标签 {0} 未找到"
        }
      },
      "Name {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "名称 {0} 未找到"
        }
      },
      "Guest {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机 {0} 未找到"
        }
      },
      "vpc {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "专有网络VPC {0} 未找到"
        }
      },
      "IPMI has no password information": {
        "zh-CN": {
          "fields": {},
          "message": "未找到IPMI密码信息"
        }
      },
      "Disk {0} dose not have snapshot": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘 {0} 没有快照"
        }
      },
      "project {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "项目 {0} 没有找到"
        }
      },
      "No ipmi information was found for host {0}": {
        "zh-CN": {
          "fields": {},
          "message": "没有找到主机 {0} 的IPMI信息"
        }
      },
      "zone {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "可用区 {0} 未找到"
        }
      },
      "region {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "区域 {0} 未找到"
        }
      },
      "Not found network by ip {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未能通过IP {0} 找到相应的IP子网"
        }
      },
      "Not found pod {0}": {
        "zh-CN": {
          "fields": {},
          "message": "pod {0} 未找到"
        }
      },
      "format {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "格式 {0} 没有找到"
        }
      },
      "Zone {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "可用区 {0} 未找到"
        }
      },
      "Network {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "IP子网 {0} 未找到"
        }
      },
      "Host {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "主机 {0} 未找到"
        }
      },
      "failed to find disk {0}": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘 {0} 未找到"
        }
      },
      "account not found": {
        "zh-CN": {
          "fields": {},
          "message": "账号未找到"
        }
      }
    }
  },
  "InvalidStatusError": {
    "zh-CN": "操作对象的当前状态不支持该操作",
    "details": {
      "eip cannot associate in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "弹性公网IP不能在 {0} 状态下绑定"
        }
      },
      "Cannot reset disk in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下扩容磁盘"
        }
      },
      "Disk {0} not attached": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘 {0} 没有被挂载"
        }
      },
      "Cloudprovider disabled": {
        "zh-CN": {
          "fields": {},
          "message": "账号被停用"
        }
      },
      "No either wire or zone provided": {
        "zh-CN": {
          "fields": {},
          "message": "没有提供二层网络或可用区信息"
        }
      },
      "Cannot purge vpc on enabled cloud provider": {
        "zh-CN": {
          "fields": {},
          "message": "不能在账号启用状态下抹除专有网络VPC信息"
        }
      },
      "Host {0} is not online": {
        "zh-CN": {
          "fields": {},
          "message": "主机 {0} 不在线"
        }
      },
      "Image status is not active": {
        "zh-CN": {
          "fields": {},
          "message": "镜像状态不可用"
        }
      },
      "Not a managed VM": {
        "zh-CN": {
          "fields": {},
          "message": "不是公有云虚拟机"
        }
      },
      "No host???": {
        "zh-CN": {
          "fields": {},
          "message": "没有主机？？？"
        }
      },
      "no subaccount": {
        "zh-CN": {
          "fields": {},
          "message": "没有子账号"
        }
      },
      "host is not a prepaid recycle host": {
        "zh-CN": {
          "fields": {},
          "message": "主机不是一个资源池相关的主机"
        }
      },
      "a recycle host shoud not allocate more than 1 guest": {
        "zh-CN": {
          "fields": {},
          "message": "资源池主机不应该关联超过一个虚拟机"
        }
      },
      "already associate with eip": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机已经关联过弹性公网IP"
        }
      },
      "No cloudregion???": {
        "zh-CN": {
          "fields": {},
          "message": "没有区域信息???"
        }
      },
      "Cannot purge snapshot on enabled cloud provider": {
        "zh-CN": {
          "fields": {},
          "message": "账号启用状态下不能抹除快照信息"
        }
      },
      "Virtual server is locked, cannot delete": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机被保护，不能删除"
        }
      },
      "Cannot do restart server in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下重启虚拟机"
        }
      },
      "cannot save torrent in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下保存种子"
        }
      },
      "Cannot modify Memory and CPU in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下更改CPU或内存信息"
        }
      },
      "Some disk not ready": {
        "zh-CN": {
          "fields": {},
          "message": "一些磁盘状态不正常"
        }
      },
      "Cannot send command in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下发送命令"
        }
      },
      "cannot associate eip in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下绑定弹性公网IP"
        }
      },
      "Cannot do maintenance while guest status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下进行维护"
        }
      },
      "cannot download in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下下载"
        }
      },
      "cannot undo a recycle host with pending_deleted guest": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "Cannot send keys in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下发送指令"
        }
      },
      "Server in {0} not able to detach disk": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下卸载磁盘"
        }
      },
      "empty file path": {
        "zh-CN": {
          "fields": {},
          "message": "文件路径为空"
        }
      },
      "Cannot perform cache image in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下缓存镜像"
        }
      },
      "Cannot change config in {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下更改配置"
        }
      },
      "multiple subaccounts": {
        "zh-CN": {
          "fields": {},
          "message": "多个子账号"
        }
      },
      "Cannot purge server on enabled host": {
        "zh-CN": {
          "fields": {},
          "message": "不能在主机启用状态下抹除虚拟机信息"
        }
      },
      "Cannot do start server in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下开机"
        }
      },
      "eip cannot dissociate in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下解绑弹性公网IP"
        }
      },
      "cannot undo recycle in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "provider is enabled": {
        "zh-CN": {
          "fields": {},
          "message": "账号已启用"
        }
      },
      "Cannot stop server in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下关机"
        }
      },
      "Cannot start baremetal with active guest": {
        "zh-CN": {
          "fields": {},
          "message": "不能在有可用的虚机状态下开启裸金属服务器"
        }
      },
      "No valid cloud provider": {
        "zh-CN": {
          "fields": {},
          "message": "未找到正确的公有云信息"
        }
      },
      "Cannot purge elastic_ip on enabled cloud provider": {
        "zh-CN": {
          "fields": {},
          "message": "账号启用状态下不能抹除弹性公网IP信息"
        }
      },
      "account is enabled": {
        "zh-CN": {
          "fields": {},
          "message": "账号已启用"
        }
      },
      "Cannot do unmaintenance in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下取消维护"
        }
      },
      "cannot recycle in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下进入资源池"
        }
      },
      "No host for server": {
        "zh-CN": {
          "fields": {},
          "message": "未找到虚机所在的主机"
        }
      },
      "instance is already associated with eip": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机已经绑定弹性公网IP"
        }
      },
      "cannot associate pending delete server": {
        "zh-CN": {
          "fields": {},
          "message": "不能绑定回收站的虚拟机"
        }
      },
      "image is shared": {
        "zh-CN": {
          "fields": {},
          "message": "镜像是共享的"
        }
      },
      "Cannot cache image with no checksum": {
        "zh-CN": {
          "fields": {},
          "message": "不能在没有校验和时缓存镜像"
        }
      },
      "cannot delete a recycle host without active instance": {
        "zh-CN": {
          "fields": {},
          "message": "不能在有活跃的虚拟机时删除资源池的主机"
        }
      },
      "Cannot purge network on enabled cloud provider": {
        "zh-CN": {
          "fields": {},
          "message": "不能在账号启用状态下抹除IP子网"
        }
      },
      "Address {0} not reserved": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 未被保留"
        }
      },
      "Fail to mark cache status: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未能设置缓存状态 {0}"
        }
      },
      "Host is a converted baremetal, should be unconverted before delete": {
        "zh-CN": {
          "fields": {},
          "message": "主机是个转换过的裸金属服务器，删除前需要转换回来"
        }
      },
      "VPC not ready": {
        "zh-CN": {
          "fields": {},
          "message": "专有网络VPC状态异常"
        }
      },
      "Cannot uncache in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下清除缓存"
        }
      },
      "Cannot reset root in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下重装系统"
        }
      },
      "Cannot detach network in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下分离网络"
        }
      },
      "Host is not disabled": {
        "zh-CN": {
          "fields": {},
          "message": "主机没有被禁用"
        }
      },
      "Cannot reset VM in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下重启虚拟机"
        }
      },
      "host should be disabled": {
        "zh-CN": {
          "fields": {},
          "message": "主机状态应该被禁止"
        }
      },
      "No eip to dissociate": {
        "zh-CN": {
          "fields": {},
          "message": "没有弹性公网IP可绑定"
        }
      },
      "Cannot suspend VM in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下休眠"
        }
      },
      "Cannot do maintenance in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下维护"
        }
      },
      "eip cannot syncstatus in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下同步状态"
        }
      },
      "Cannot stop baremetal with non-active guest": {
        "zh-CN": {
          "fields": {},
          "message": "不能在没有虚拟机情况下停止裸金属服务器"
        }
      },
      "Cannot purge route_table on enabled cloud provider": {
        "zh-CN": {
          "fields": {},
          "message": "不能在账号启用状态下抹除路由表信息"
        }
      },
      "cannot upload in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下上传"
        }
      },
      "cannot change bandwidth in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下更改带宽信息"
        }
      },
      "Wrong guest status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的虚拟机状态 {0}"
        }
      },
      "Baremetal {0} is not ready": {
        "zh-CN": {
          "fields": {},
          "message": "裸金属服务器 {0} 状态异常"
        }
      },
      "Baremetal {0} not enabled": {
        "zh-CN": {
          "fields": {},
          "message": "裸金属服务器 {0} 未启用"
        }
      },
      "Cannot prepare baremetal in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下预准备裸金属服务器"
        }
      },
      "Cannot do snapshot when VM in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下保存快照"
        }
      },
      "no valid host": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的主机"
        }
      },
      "Not allow to change config": {
        "zh-CN": {
          "fields": {},
          "message": "不允许更改配置"
        }
      },
      "No valid host": {
        "zh-CN": {
          "fields": {},
          "message": "不正确的主机"
        }
      },
      "cannot associate server in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下绑定虚拟机"
        }
      },
      "Account disabled": {
        "zh-CN": {
          "fields": {},
          "message": "账号已禁用"
        }
      }
    }
  },
  "ResourceNotReadyError": {
    "zh-CN": "资源未准备好或资源状态异常，请稍后再试",
    "details": {
      "Save disk when disk is READY": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘未准备好， 请稍后再试"
        }
      },
      "Resize disk when disk is READY": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘未准备好， 请稍后再试"
        }
      },
      "host not connect storage {0}": {
        "zh-CN": {
          "fields": {},
          "message": "主机未关联存储 {0}"
        }
      },
      "Save disk when not being USED": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘关联的主机正在运行"
        }
      }
    }
  },
  "NotEmptyError": {
    "zh-CN": "资源不为空，请确认该资源下没有其他关联项后继续操作",
    "details": {
      "not empty cloud region": {
        "zh-CN": {
          "fields": {},
          "message": "区域内还有资源没删除"
        }
      },
      "Image is in use": {
        "zh-CN": {
          "fields": {},
          "message": "镜像被使用中，无法删除"
        }
      },
      "Local host storage is not empty???": {
        "zh-CN": {
          "fields": {},
          "message": "本地存储还有磁盘文件"
        }
      },
      "Isolated device used by server": {
        "zh-CN": {
          "fields": {},
          "message": "独立设备有虚拟机在使用，不能删除"
        }
      },
      "Not an empty storage provider": {
        "zh-CN": {
          "fields": {},
          "message": "存储被挂载或存储底下依然有磁盘、快照"
        }
      },
      "not an empty wire": {
        "zh-CN": {
          "fields": {},
          "message": "该二层网络下的部分IP子网已经被使用，不支持当前操作"
        }
      },
      "not empty zone": {
        "zh-CN": {
          "fields": {},
          "message": "可用区底下依然有资源"
        }
      },
      "guest on the host are using networks on this wire": {
        "zh-CN": {
          "fields": {},
          "message": "二层网络依然关联有虚拟机网卡"
        }
      },
      "Inconsistent: local storage is not empty???": {
        "zh-CN": {
          "fields": {},
          "message": "主机底下的存储依然存在磁盘或快照"
        }
      },
      "the security group is in use": {
        "zh-CN": {
          "fields": {},
          "message": "安全组依然有虚拟机在使用"
        }
      },
      "Virtual disk used by virtual servers": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘依然有虚拟机在使用"
        }
      },
      "VPC not empty": {
        "zh-CN": {
          "fields": {},
          "message": "专有网络VPC底下依然有IP子网存在"
        }
      },
      "Tag is associated with hosts": {
        "zh-CN": {
          "fields": {},
          "message": "标签有被主机所使用"
        }
      },
      "guest on the host are using disks on this storage": {
        "zh-CN": {
          "fields": {},
          "message": "此主机存储底下关联有虚拟机磁盘"
        }
      },
      "tag has dynamic rules": {
        "zh-CN": {
          "fields": {},
          "message": "调度策略底下有动态调度标签"
        }
      },
      "Not an empty cloud provider": {
        "zh-CN": {
          "fields": {},
          "message": "账号底下有资源未删除"
        }
      },
      "The image has been cached on storages": {
        "zh-CN": {
          "fields": {},
          "message": "缓存镜像有被关联的存储所缓存"
        }
      },
      "instance_type used by servers": {
        "zh-CN": {
          "fields": {},
          "message": "套餐已经被虚拟机使用"
        }
      },
      "Cannot delete keypair used by servers": {
        "zh-CN": {
          "fields": {},
          "message": "密钥对已经有虚拟机在使用"
        }
      },
      "Not an empty host": {
        "zh-CN": {
          "fields": {},
          "message": "主机底下有虚拟机资源"
        }
      },
      "not an empty network": {
        "zh-CN": {
          "fields": {},
          "message": "有网卡使用此IP子网里面的IP地址"
        }
      },
      "storage cache not empty": {
        "zh-CN": {
          "fields": {},
          "message": "存储缓存里面存在缓存的镜像文件"
        }
      },
      "tag is associate with sched policies": {
        "zh-CN": {
          "fields": {},
          "message": "调度策略有使用此调度标签"
        }
      }
    }
  },
  "UnauthorizedError": {
    "zh-CN": "认证信息错误，请查证后重试",
    "details": {
      "No token founded": {
        "zh-CN": {
          "fields": {},
          "message": "未发现凭证信息"
        }
      },
      "clientId、clientScret or subscriptId input error": {
        "zh-CN": {
          "fields": {},
          "message": "客户端ID、客户端密码或订阅ID信息错误"
        }
      }
    }
  },
  "ResourceNotFoundError2": {
    "zh-CN": "输入的值有误，请更正后重试",
    "details": {}
  },
  "NotSufficientPrivilegeError": {
    "zh-CN": "没有权限执行该操作，请切换至管理后台或使用管理员用户登录后重试",
    "details": {
      "cannot set system key": {
        "zh-CN": {
          "fields": {},
          "message": "不能设置系统元数据"
        }
      },
      "not allow to set system key {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能设置系统元数据 {0}"
        }
      },
      "non-admin user not allowed to create system object": {
        "zh-CN": {
          "fields": {},
          "message": "非系统管理员禁止创建系统资源"
        }
      },
      "Only system admin can specify preferred host": {
        "zh-CN": {
          "fields": {},
          "message": "只有系统管理员才允许指定对应的主机"
        }
      }
    }
  },
  "ForbiddenError": {
    "zh-CN": "禁止操作",
    "details": {
      "not allow to purge. Virtual disk must not have snapshots": {
        "zh-CN": {
          "fields": {},
          "message": "请先删除该硬盘快照，再执行清除操作"
        }
      },
      "not allow to delete. Virtual disk must not have snapshots": {
        "zh-CN": {
          "fields": {},
          "message": "请先删除该硬盘快照，再执行删除操作"
        }
      },
      "Not allow to get details": {
        "zh-CN": {
          "fields": {},
          "message": "不允许获取详情"
        }
      },
      "{0} not allow to get spec {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不允许获取 {0} {1} 资源"
        }
      },
      "{0} not allow to perform action {1}": {
        "zh-CN": {
          "fields": {},
          "message": "不允许对 {0} 进行 {1} 操作"
        }
      },
      "not allow to get usages": {
        "zh-CN": {
          "fields": {},
          "message": "不允许获取资源使用情况"
        }
      },
      "only admin can create prepaid resource": {
        "zh-CN": {
          "fields": {},
          "message": "只有系统管理员可以创建预付费资源"
        }
      },
      "Only system admin allowed to use reserved ip": {
        "zh-CN": {
          "fields": {},
          "message": "只有系统管理员允许使用保留IP"
        }
      },
      "Not allow to attach": {
        "zh-CN": {
          "fields": {},
          "message": "不允许关联资源"
        }
      },
      "Cannot update a managed network": {
        "zh-CN": {
          "fields": {},
          "message": "不允许更改公有云IP子网"
        }
      },
      "{0}({1}) not allow to delete": {
        "zh-CN": {
          "fields": {},
          "message": "不允许删除 {0} 的 {1} 资源"
        }
      },
      "not allow to delete public cloud instance_type: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不允许删除公有云套餐 {0}"
        }
      },
      "Not allow to update item": {
        "zh-CN": {
          "fields": {},
          "message": "不允许更新"
        }
      },
      "Delegation not allowed": {
        "zh-CN": {
          "fields": {},
          "message": "没有授权"
        }
      },
      "not allow to perform {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不允许进行 {0} 操作"
        }
      },
      "can not update instance_type for public cloud {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不允许更新公有云套餐 {0}"
        }
      },
      "cannot delete: there still exists {1} user related with domain {0}.": {
        "zh-CN": {
          "fields": {},
          "message": "域名 {0} 底下依然关联有 {1} 个用户"
        }
      },
      "not allow to delete prepaid disk in valid status": {
        "zh-CN": {
          "fields": {},
          "message": "预付费磁盘未过期，不允许删除"
        }
      },
      "now allow to delete inuse instance_type.please remove related servers first: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能删除套餐 {0}，请先解除与主机之间的关联关系"
        }
      },
      "not allow to delete prepaid server in valid status": {
        "zh-CN": {
          "fields": {},
          "message": "不能删除未过期的预付费虚拟机"
        }
      },
      "operation not allowed": {
        "zh-CN": {
          "fields": {},
          "message": "操作未被允许"
        }
      },
      "Not allow to list": {
        "zh-CN": {
          "fields": {},
          "message": "没有权限列出资源"
        }
      },
      "System admin only": {
        "zh-CN": {
          "fields": {},
          "message": "没有系统管理员权限"
        }
      },
      "{0} not allow to get property {1}": {
        "zh-CN": {
          "fields": {},
          "message": "没有权限获取 {0} 的 {1}"
        }
      },
      "domain {0} did not allowed deleted": {
        "zh-CN": {
          "fields": {},
          "message": "默认域名 {0} 不允许被删除"
        }
      },
      "image is protected": {
        "zh-CN": {
          "fields": {},
          "message": "镜像被锁定中"
        }
      },
      "Not allow to create item": {
        "zh-CN": {
          "fields": {},
          "message": "没有权限创建资源"
        }
      },
      "can not create instance_type for public cloud {0}": {
        "zh-CN": {
          "fields": {},
          "message": "公有云套餐是只读，不能创建 {0}"
        }
      }
    }
  },
  "BadGatewayError": {
    "zh-CN": "网关错误",
    "details": {}
  },
  "WeakPasswordError": {
    "zh-CN": "弱口令，请更换为较复杂的密码后重试",
    "details": {
      "password must be 12 chars of at least one digit, letter, uppercase letter and punctuate": {
        "zh-CN": {
          "fields": {},
          "message": "密码必须由至少一个数字、字母、大写字母和标点符号组成的12位字符组成"
        }
      },
    }
  },
  "InsufficientResourceError": {
    "zh-CN": "资源不足，请增加资源或释放资源后重试",
    "details": {
      "host has been occupied": {
        "zh-CN": {
          "fields": {},
          "message": "预付费主机底下已经存在一个预付费虚拟机"
        }
      },
      "Reserved address {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "预留IP {0} 未找到"
        }
      },
      "Not enough free space": {
        "zh-CN": {
          "fields": {},
          "message": "没有足够的存储空间"
        }
      },
      "Baremetal {0} is occupied": {
        "zh-CN": {
          "fields": {},
          "message": "裸金属服务器 {0} 被占用"
        }
      },
      "Out of IP address": {
        "zh-CN": {
          "fields": {},
          "message": "未找到可用的IP地址"
        }
      }
    }
  },
  "OutOfResourceError": {
    "zh-CN": "资源不足，请增加资源或释放资源后重试",
    "details": {
      "Not enough free space": {
        "zh-CN": {
          "fields": {},
          "message": "没有足够的存储空间"
        }
      }
    }
  },
  "ActionNotFoundError": {
    "zh-CN": "不支持该操作",
    "details": {
      "Action {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的 {0} 操作"
        }
      }
    }
  },
  "UnsupportOperationError": {
    "zh-CN": "不支持该操作，可能由于逻辑问题或权限问题所致",
    "details": {
      "fixed eip cannot be associated": {
        "zh-CN": {
          "fields": {},
          "message": "固定IP不能关联虚拟机"
        }
      },
      "Directly creating cloudprovider is not supported, create cloudaccount instead": {
        "zh-CN": {
          "fields": {},
          "message": "不支持直接创建子账号，请先创建主账号"
        }
      },
      "Container not support {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的 {0} 操作"
        }
      },
      "fixed eip cannot sync status": {
        "zh-CN": {
          "fields": {},
          "message": "固定IP不允许同步状态"
        }
      },
      "Cannot assign security group for this guest {0}": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机 {0} 不支持绑定安全组"
        }
      },
      "Cannot resize disk for baremtal": {
        "zh-CN": {
          "fields": {},
          "message": "裸金属服务器不支持扩容磁盘"
        }
      },
      "Cannot save image for baremtal": {
        "zh-CN": {
          "fields": {},
          "message": "裸金属服务器不支持保存镜像"
        }
      },
      "guest {0} band to up to {1} security groups": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机 {0} 最多绑定 {1} 个安全组"
        }
      },
      "Not supported, please use kubectl": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的操作，请考虑使用 kubectl"
        }
      },
      "Disk cannot be thrink": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘不支持缩容"
        }
      },
      "fixed public eip cannot be dissociated": {
        "zh-CN": {
          "fields": {},
          "message": "公网IP不支持卸载"
        }
      },
      "domain {0} did not allowed update Name": {
        "zh-CN": {
          "fields": {},
          "message": "默认域名 {0} 不支持更新名称"
        }
      },
      "Cannot detach sys disk": {
        "zh-CN": {
          "fields": {},
          "message": "不支持卸载系统盘"
        }
      },
      "Cannot change config for baremtal": {
        "zh-CN": {
          "fields": {},
          "message": "裸金属服务器不支持调整配置"
        }
      },
      "cloudregion {0}({1}) not support {2} scheduler": {
        "zh-CN": {
          "fields": {},
          "message": "{0} 暂不支持 【{2}】调度算法"
        }
      }
    }
  },
  "OutOfQuotaError": {
    "zh-CN": "超过配额限制，请释放限制资源或者联系管理员增加配额",
    "details": {
      "Check set pending quota error {0}": {
        "zh-CN": {
          "fields": {},
          "message": "快照配额不足，请联系管理员调整配额；若是管理后台，请调整system项目的配额"
        }
      },
      "Out of eip quota: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "EIP超过限额 {0}"
        }
      },
      "Check set pending quota error {0}": {
        "zh-CN": {
          "fields": {},
          "message": "限额异常: {0}"
        }
      },
      "out of memory quota": {
        "zh-CN": {
          "fields": {},
          "message": "当前项目的内存超出配额限制，请适当释放资源或联系管理员增加配额"
        }
      }
    }
  },
  "ResourceNotFoundError": {
    "zh-CN": "输入的值有误，请更正后重试",
    "details": {
      "Disk {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现磁盘 {0}"
        }
      },
      "provider {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现子账号 {0}"
        }
      },
      "wire {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现二层网络 {0}"
        }
      },
      "storage {0} not found: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "存储 {0} 未发现 {1}"
        }
      },
      "zone {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现可用区 {0}"
        }
      },
      "Cloud provider {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现子账号 {0}"
        }
      },
      "zone {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未发现可用区 {0}"
        }
      },
      "keypair {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现密钥对 {0}"
        }
      },
      "network {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现IP子网 {0}"
        }
      },
      "Network {0} not found {1}": {
        "zh-CN": {
          "fields": {},
          "message": "未发现IP子网 {0} {1}"
        }
      },
      "host {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现主机 {0}"
        }
      },
      "guest {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现虚拟机 {0}"
        }
      },
      "No zone for this disk": {
        "zh-CN": {
          "fields": {},
          "message": "未找到磁盘所在的可用区"
        }
      },
      "{0} {1} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现 {0} {1}"
        }
      },
      "VPC {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现专有网络VPC {0}"
        }
      },
      "cloud provider {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现子账号 {0}"
        }
      },
      "Invalid schedtag {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未发现调度标签 {0}"
        }
      },
      "{0} {1} not find": {
        "zh-CN": {
          "fields": {},
          "message": "未发现 {0} {1}"
        }
      },
      "no such provider {0}": { //感觉需要改下描述
        "zh-CN": {
          "fields": {},
          "message": "不支持的公有云 {0}"
        }
      },
      "Schedtag {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现调度标签 {0}"
        }
      },
      "schedtag {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现调度标签 {0}"
        }
      },
      "Storage {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现存储 {0}"
        }
      },
      "Region {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现区域 {0}"
        }
      },
      "Cloud provider/manager {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现子账号 {0}"
        }
      },
      "eip {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现弹性公网IP"
        }
      },
      "Secgroup {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现安全组 {0}"
        }
      },
      "cloud region {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未发现区域 {0}"
        }
      },
      "disk {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到磁盘 {0}"
        }
      },
      "IsolatedDevice {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到独立设备 {0}"
        }
      },
      "fail to find storage for disk {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未找到磁盘 {0} 对应的存储"
        }
      },
      "Wire {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到二层网络 {0}"
        }
      },
      "region {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到区域 {0}"
        }
      },
      "storage not cache image": {
        "zh-CN": {
          "fields": {},
          "message": "存储未缓存此镜像"
        }
      },
      "Zone {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到可用区"
        }
      },
      "secgroup {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到安全组 {0}"
        }
      },
      "Keypair {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到密钥对 {0}"
        }
      },
      "Resource {0} not found in {1}": {
        "zh-CN": {
          "fields": {},
          "message": "未在 {0} 中找到资源 {1}"
        }
      },
      "server {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到虚拟机 {0}"
        }
      },
      "Host {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到主机 {0}"
        }
      }
    }
  },
  "TimeoutError": {
    "zh-CN": "请求超时，请稍后重试，如果一直出现该问题请联系管理员",
    "details": {
      "request process timeout": {
        "zh-CN": {
          "fields": {},
          "message": "请求执行超时"
        }
      }
    }
  },
  "TenantNotFoundError": {
    "zh-CN": "找不到指定的用户或项目",
    "details": {
      "tenant {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到项目 {0}"
        }
      }
    }
  },
  "MissingParameterError": {
    "zh-CN": "缺少参数，请修正后重试",
    "details": {
      "Missing parameter {0}": {
        "zh-CN": {
          "fields": {},
          "message": "缺少 {0} 参数"
        }
      },
    }
  },
  "ServerStatusError": {
    "zh-CN": "云服务器当前状态不支持该操作，请开启或关机后重试",
    "details": {
      "Cannot deploy in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机不能在 {0} 状态下进行部署"
        }
      },
      "Insert ISO not allowed in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机不能在 {0} 状态下插入ISO光盘"
        }
      },
      "Cannot normal migrate guest in status {0}, try rescue mode or server-live-migrate?": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机不能在 {0} 状态下迁移，请勾选强制迁移后重试"
        }
      },
      "Disk attached guest status must be ready": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘挂载的主机必须是关机状态"
        }
      },
      "Eject ISO not allowed in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机不能在 {0} 状态下弹出ISO光盘"
        }
      }
    }
  },
  "InternalServerError": {
    "zh-CN": "云服务器内部错误",
    "details": {
      'cluster "default" not found k8s api endpoint': {
        "zh-CN": {
          "fields": {},
          "message": "当前没有可用的k8s集群，请创建集群后重试。"
        }
      },
      "fetching user list failed: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "匹配用户列表失败 {0}"
        }
      },
      "Query region {0} fail {1}": {
        "zh-CN": {
          "fields": {},
          "message": "查询区域 {0} 失败"
        }
      },
      "query vpc {0} error {1}": {
        "zh-CN": {
          "fields": {},
          "message": "查询专有网络VPC {0} 失败 {1}"
        }
      },
      "query wire {0} error {1}": {
        "zh-CN": {
          "fields": {},
          "message": "查询二层网络 {0} 失败 {1}"
        }
      },
      "get reserved ip error": {
        "zh-CN": {
          "fields": {},
          "message": "获取保留IP失败"
        }
      },
      "Invald {0} return value": {
        "zh-CN": {
          "fields": {},
          "message": "{0} 返回异常结果"
        }
      },
      "query zone {0} error {1}": {
        "zh-CN": {
          "fields": {},
          "message": "查询可用区 {0} 失败 {1}"
        }
      },
      "Get object error: {0}": { //感觉后端应该是 get list error
        "zh-CN": {
          "fields": {},
          "message": "获取获取列表失败"
        }
      },
      "Invalid data JSONObject": {
        "zh-CN": {
          "fields": {},
          "message": "解析JSON失败"
        }
      },
      "region {0} query fail {1}": {
        "zh-CN": {
          "fields": {},
          "message": "查询区域 {0} 失败 {1}"
        }
      },
      "Fetch Vpc {0} error {1}": {
        "zh-CN": {
          "fields": {},
          "message": "匹配专有网络VPC {0} 失败 {1}"
        }
      },
      "fail to get http response writer from context": {
        "zh-CN": {
          "fields": {},
          "message": "获取http请求参数失败"
        }
      },
      "vpc {0} query fail {1}": {
        "zh-CN": {
          "fields": {},
          "message": "查询专有网络VPC {0} 失败 {1}"
        }
      },
      "query all networks fail": {
        "zh-CN": {
          "fields": {},
          "message": "获取IP子网列表失败"
        }
      },
      "storage cache is missing": {
        "zh-CN": {
          "fields": {},
          "message": "获取存储缓存失败"
        }
      },
      "query wire for zone {0} and vpc {1} error {2}": {
        "zh-CN": {
          "fields": {},
          "message": "获取可用区 {0} 及专有网络VPC {1} 关联的二层网络失败 {2}"
        }
      },
      "delete sku {0} failed.": {
        "zh-CN": {
          "fields": {},
          "message": "删除套餐 {0} 失败"
        }
      },
      "query sku list failed.": {
        "zh-CN": {
          "fields": {},
          "message": "获取套餐列表失败"
        }
      },
      "Host missing": {
        "zh-CN": {
          "fields": {},
          "message": "未找到虚拟机所在的主机"
        }
      },
      "Not found a running controlplane machine, status is creating": {
        "zh-CN": {
          "fields": {},
          "message": "没有找到状态为【运行中】的【控制节点】，节点正在创建中..."
        }
      },
      "Isolated device and guest are not located in the same host": {
        "zh-CN": {
          "fields": {},
          "message": "GPU设备和该云服务器不在同一个宿主机上"
        }
      }
    }
  },
  "ProtectedResourceError": {
    "zh-CN": "被保护的资源，不支持该操作",
    "details": {
      "not allow to delete default security group": {
        "zh-CN": {
          "fields": {},
          "message": "不允许删除默认安全组"
        }
      },
      "not allow to delete default vpc": {
        "zh-CN": {
          "fields": {},
          "message": "不允许删除默认专有网络VPC"
        }
      },
      "not allow to delete default cloud region": {
        "zh-CN": {
          "fields": {},
          "message": "不允许删除默认区域"
        }
      }
    }
  },
  "NotAcceptableError": {
    "zh-CN": "输入参数有误，请修正后重试",
    "details": {
      "Host should be disabled": {
        "zh-CN": {
          "fields": {},
          "message": "需要先禁用主机"
        }
      },
      "Cannot unconvert in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下逆转"
        }
      },
      "PTR cannot mix with other types": {
        "zh-CN": {
          "fields": {},
          "message": "PTR不能和其他类型混合"
        }
      },
      "Cannot mix different types of records, {0} != {1}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "AAAA: record value must be ipv6 address: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "Not allow for hypervisor {0}": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟化 {0} 不支持此操作"
        }
      },
      "{0}: name cannot be ip address: {1}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "host_type must be specified": {
        "zh-CN": {
          "fields": {},
          "message": "必须指定主机类型"
        }
      },
      "{0}: {1} must be domain name: {2}": {
        "zh-CN": {
          "fields": {},
          "message": "{0} {1} 必须符合域名规则 {2}"
        }
      },
      "{0}: {1} cannot be ip address: {2}": {
        "zh-CN": {
          "fields": {},
          "message": "{0} {1} 不能是IP地址 {2}"
        }
      },
      "Baremetal host is aleady occupied": {
        "zh-CN": {
          "fields": {},
          "message": "裸金属服务器已经被占用"
        }
      },
      "PTR: invalid ptr record name: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "network {0}({1}) has no free addresses": {
        "zh-CN": {
          "fields": {},
          "message": "IP子网 {0}({1}) 没有可用IP"
        }
      },
      "SRV: invalid priority number: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "{0}: unknown record type": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "CNAME cannot mix with other types": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "SRV cannot mix with other types": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "Unsupport driver type {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不支持的转换类型"
        }
      },
      "Not a baremetal": {
        "zh-CN": {
          "fields": {},
          "message": "此服务器不是裸金属服务器"
        }
      },
      "SRV: insufficient param: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "SRV: invalid weight number: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "SRV: invalid srv record name: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "Must be a baremetal host": {
        "zh-CN": {
          "fields": {},
          "message": "此服务器必须是裸金属服务器"
        }
      },
      "Not being convert to hypervisor": { //这个也不知道怎么翻译
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "A: record value must be ipv4 address: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "Not an converted hypervisor": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机不是裸金属服务器"
        }
      },
      "Not an empty host": {
        "zh-CN": {
          "fields": {},
          "message": "主机底下依然关联有虚拟机"
        }
      },
      "SRV: invalid port number: {0}": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "{0}: invalid domain name: {1}": {
        "zh-CN": {
          "fields": {},
          "message": "{0} 不符合域名规则 {1}"
        }
      },
      "Connot convert hypervisor in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态进行转换"
        }
      },
      "SRV: priority number {0} not in range [0,65535]": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "Not allow empty records": {
        "zh-CN": {
          "fields": {},
          "message": "记录不能为空"
        }
      },
      "Records limit exceeded.": {
        "zh-CN": {
          "fields": {},
          "message": "记录超过限制"
        }
      },
      "SRV: weight number {0} not in range [0,65535]": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      }
    }
  },
  "DuplicateResourceError": {
    "zh-CN": "资源重复，请确认要创建的资源无误后重试",
    "details": {
      "Duplicate access_mac {0}": {
        "zh-CN": {
          "fields": {},
          "message": "MAC地址冲突 {0}"
        }
      },
      "This RBD Storage[{0}/{1}] has already exist": {
        "zh-CN": {
          "fields": {},
          "message": "Ceph共享存储 {0}/{1} 已经存在"
        }
      },
      "sku cpu {0} mem {1}(Mb) already exists": {
        "zh-CN": {
          "fields": {},
          "message": "套餐 CPU {0} 内存 {1}Mb 已经存在"
        }
      },
      "duplicate instanceType {0}": {
        "zh-CN": {
          "fields": {},
          "message": "套餐信息 {0} 重复"
        }
      },
      "Duplicate manager_uri {0}": {
        "zh-CN": {
          "fields": {},
          "message": "管理地址 {0} 冲突"
        }
      },
      "Duplicate access_ip {0}": {
        "zh-CN": {
          "fields": {},
          "message": "访问IP {0} 冲突"
        }
      },
      "Duplicate sku {0}": {
        "zh-CN": {
          "fields": {},
          "message": "套餐 {0} 重复，请调整配置"
        }
      }
    }
  },
  "ResourceBusyError": {
    "zh-CN": "资源状态不可用，请查看资源状态或稍后操作",
    "details": {
      "Cannot sync in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下进行同步操作"
        }
      },
      "Cannot delete the last cache": {
        "zh-CN": {
          "fields": {},
          "message": "不能删除最后一个缓冲镜像"
        }
      },
      "Active download session not expired": {
        "zh-CN": {
          "fields": {},
          "message": "下载会话未过期"
        }
      },
      "backendgroup aready related with other listener/rule": {
        "zh-CN": {
          "fields": {},
          "message": "该后端服务器组已经关联其他的监听/转发规则"
        }
      }
    }
  },
  "ConflictError": {
    "zh-CN": "资源冲突，请查看资源的状态",
    "details": {
      "conflict with lbagent {0}({1}): {2}":{
      	"zh-CN": {
          "fields": {},
          "message": "和{0}({1})资源冲突，{2}，请查看资源的状态"
        }
      },
      "eip has been associated with instance": {
        "zh-CN": {
          "fields": {},
          "message": "弹性公网IP已经绑定到其他虚拟机"
        }
      },
      "Isolated device already attached to another guest: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "独立设备已经挂载到其他虚拟机 {0}"
        }
      },
      "Conflict access_ip {0}": {
        "zh-CN": {
          "fields": {},
          "message": "访问IP {0} 冲突"
        }
      },
      "eip has been associated": {
        "zh-CN": {
          "fields": {},
          "message": "弹性公网IP已经绑定到其他虚拟机"
        }
      },
      "Conflict manager_uri {0}": {
        "zh-CN": {
          "fields": {},
          "message": "管理地址 {0} 冲突"
        }
      },
      "Cannot update external resource": {
        "zh-CN": {
          "fields": {},
          "message": "不能更新公用云资源"
        }
      },
      "Duplicate image name {0}": {
        "zh-CN": {
          "fields": {},
          "message": "镜像名称 {0} 冲突"
        }
      },
      "The account has been registered": {
        "zh-CN": {
          "fields": {},
          "message": "此账号已经被注册过了"
        }
      },
      "cannot create prepaid server on prepaid resource type": { //这个找剑哥
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      },
      "more than 1 wire found for zone {0} and vpc {1}": {
        "zh-CN": {
          "fields": {},
          "message": "可用区 {0} 专有网络VPC {1} 底下的二层网络不能超过1个"
        }
      },
      "{0} listener port {1} is already taken by listener {2}({3})": {
        "zh-CN": {
          "fields": {},
          "message": "负载均衡监听 {0} 的端口 {1} 已经被监听器 {2}({3}) 使用了"
        }
      },
      "Address {0} has been used": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 已经被使用了"
        }
      },
      "rule {0}/{1} already occupied by rule %s(%s)": {
        "zh-CN": {
          "fields": {},
          "message": "监听规则 {0}/{1} 已经被监听器 {2}({3}) 占用"
        }
      },
      "the image reference session has not been expired!": {
        "zh-CN": {
          "fields": {},
          "message": "镜像缓存未过期"
        }
      },
      "failed getting region of vpc {0}({1})": {
        "zh-CN": {
          "fields": {},
          "message": "通过专有网络VPC {0}({1}) 查找区域失败"
        }
      },
      "Access url and account conflict": {
        "zh-CN": {
          "fields": {},
          "message": "账号重复"
        }
      },
      "{0} with {1} already exist.": {
        "zh-CN": {
          "fields": {},
          "message": "{0}为{1}已经存在"
        }
      },
      "{0} {1} already exist.": {
        "zh-CN": {
          "fields": {},
          "message": "{0} {1}已经存在"
        }
      },
      "duplicate username": {
        "zh-CN": {
          "fields": {},
          "message": "用户名冲突，请使用“用户名@企业账户名”登录，或者通过您的企业用户登录地址登录。"
        }
      }
    }
  },
  "ImageNotFoundError": {
    "zh-CN": "未找到指定镜像，请更换镜像重试",
    "details": {
      "Image {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "镜像 {0} 未找到"
        }
      },
    }
  },
  "BadRequestError": {
    "zh-CN": "请求错误，请查看表单信息，确认无误后重试，继续报错，请联系管理员",
    "details": {
      "IP {0} not attach to any wire": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址未匹配到二层网络，请更正后重试"
        }
      },
      "Name conflict?": { //这个最终会被弃用
        "zh-CN": {
          "fields": {},
          "message": "快照名称冲突"
        }
      },
      "Invaild mac address": {
        "zh-CN": {
          "fields": {},
          "message": "MAC地址不合法，请更正后重试"
        }
      },
      "No template for root disk": {
        "zh-CN": {
          "fields": {},
          "message": "系统镜像不能为空，请输入系统镜像"
        }
      },
      "No return value, so why query?": {
        "zh-CN": {
          "fields": {},
          "message": "表单不能为空，请输入关键词进行查询"
        }
      },
      "Fetch netif error {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未找到主机网卡信息 {0}"
        }
      },
      "Snapshot {0} dose not have convert snapshot": { //找wyq
        "zh-CN": {
          "fields": {},
          "message": "{0} 该快照暂时不能操作，请稍后重试"
        }
      },
      "Cannot reset disk with snapshot in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下通过快照还原磁盘"
        }
      },
      "Cannot Delete disk {0} snapshots, disk exist": {
        "zh-CN": {
          "fields": {},
          "message": "不能删除磁盘 {0} 的快照, 磁盘未删除"
        }
      },
      "Already have create backup server": {
        "zh-CN": {
          "fields": {},
          "message": "备份服务器已经创建"
        }
      },
      "Cannot create backup with isolated device": {
        "zh-CN": {
          "fields": {},
          "message": "该机器已经绑定了GPU，无法创建备份机，如需创建，请取消关联GPU"
        }
      },
      "Cannot start a non-baremetal host": {
        "zh-CN": {
          "fields": {},
          "message": "不能启动非裸金属主机"
        }
      },
      "IP {0} not attach to wire {1}": {
        "zh-CN": {
          "fields": {},
          "message": "IP地址 {0} 不归属于二层网络{1}"
        }
      },
      "Disk dosen't attach guest??": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘未挂载"
        }
      },
      "Disk {0} snapshot full, cannot take any more": {
        "zh-CN": {
          "fields": {},
          "message": "该磁盘创建的快照数量已达上限，如需创建，请先清理已有的快照"
        }
      },
      "Only ADMIN and IPMI nic can be enable": {
        "zh-CN": {
          "fields": {},
          "message": "只有 ADMIN 和 IPMI 的网卡才可以被启用"
        }
      },
      "No valid host": {
        "zh-CN": {
          "fields": {},
          "message": "未找到可用的宿主机"
        }
      },
      "Create disk on host error: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘配额已到达上限 {0}，请清理回收站释放资源或联系管理员调整配额"
        }
      },
      "Params vcpu_count parse error": {
        "zh-CN": {
          "fields": {},
          "message": "vcpu_count 参数有误，请更正后重试"
        }
      },
      "Snapshot error: disk index 0 but disk type is {0}": {
        "zh-CN": {
          "fields": {},
          "message": "第一块磁盘类型为 {0}，而不是系统盘"
        }
      },
      "Cannot stop baremetal with active guest": {
        "zh-CN": {
          "fields": {},
          "message": "该物理机已被分配，不能进行关机操作"
        }
      },
      "Index Not fount or out of NIC index": {
        "zh-CN": {
          "fields": {},
          "message": "未找到指定网卡信息，请更正后重试"
        }
      },
      "Params vmem_size parse error": {
        "zh-CN": {
          "fields": {},
          "message": "vmem_size 参数错误，请更正后重试"
        }
      },
      "CD-ROM not empty, please eject first": {
        "zh-CN": {
          "fields": {},
          "message": "光盘设备不为空，请先弹出"
        }
      },
      "Cannot migrate with isolated devices": {
        "zh-CN": {
          "fields": {},
          "message": "不能在有独立设备情况下进行迁移"
        }
      },
      "Fetch storage error: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "未能找到磁盘存储 {0}"
        }
      },
      "No valid storage on current host": {
        "zh-CN": {
          "fields": {},
          "message": "未找到匹配的存储"
        }
      },
      "Can not delete disk snapshots, have manual snapshot": {
        "zh-CN": {
          "fields": {},
          "message": "不能删除磁盘的快照，因为里面有手动创建的快照"
        }
      },
      "Cannot reset baremetal in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下重启裸金属服务器"
        }
      },
      "Cannot create backup with snapshot": {
        "zh-CN": {
          "fields": {},
          "message": "不能在有快照的情况下创建主备服务器"
        }
      },
      "No ISO to eject": {
        "zh-CN": {
          "fields": {},
          "message": "没有ISO设备可弹出"
        }
      },
      "Isolated device used by server: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "独立设备还在被虚拟机 {0} 使用"
        }
      },
      "Parse disk info error: {0}": {
        "zh-CN": {
          "fields": {},
          "message": "匹配磁盘信息失败 {0}"
        }
      },
      "Cannot start baremetal with active guest": {
        "zh-CN": {
          "fields": {},
          "message": "不能在有活跃的虚拟机情况下启动裸金属服务器"
        }
      },
      "Guest no backup host": {
        "zh-CN": {
          "fields": {},
          "message": "虚拟机没有备用主机寄存"
        }
      },
      "Option key required": {
        "zh-CN": {
          "fields": {},
          "message": "缺少 key 参数"
        }
      },
      "Invalid mac address": {
        "zh-CN": {
          "fields": {},
          "message": "错误的MAC地址"
        }
      },
      "Backup only support hypervisor kvm": {
        "zh-CN": {
          "fields": {},
          "message": "主备虚拟机只支持kvm虚拟化"
        }
      },
      "Cannot swith to backup when guest in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 情况下进行主备虚拟机切换"
        }
      },
      "Miss operating system???": {
        "zh-CN": {
          "fields": {},
          "message": "缺少操作系统信息"
        }
      },
      "Cannot stop a non-baremetal host": {
        "zh-CN": {
          "fields": {},
          "message": "不能停止非逻辑上服务器"
        }
      },
      "Cannot create backup with isolated degices": { //拼写错了
        "zh-CN": {
          "fields": {},
          "message": "不能在有独立设备情况下创建主备虚拟机"
        }
      },
      "Cannot attach network in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下关联网卡"
        }
      },
      "Bandwidth must be non-negative": {
        "zh-CN": {
          "fields": {},
          "message": "带宽必须是正整数"
        }
      },
      "Snapshot {0} storage {1} not found, is public cloud?": {
        "zh-CN": {
          "fields": {},
          "message": "未找到快照 {0} 的存储 {1}, 应该是公有云快照"
        }
      },
      "Rescue mode requires all disk store in shared storages": {
        "zh-CN": {
          "fields": {},
          "message": "救援模式要求所有的磁盘所在的存储必须是共享的"
        }
      },
      "instance specs list query error": {
        "zh-CN": {
          "fields": {},
          "message": "获取套餐信息列表失败"
        }
      },
      "Cannot do live migrate, too low qemu version": {
        "zh-CN": {
          "fields": {},
          "message": "因qemu版本太低，不能进行在线迁移"
        }
      },
      "Interface {0} not exist": {
        "zh-CN": {
          "fields": {},
          "message": "网卡 {0} 不存在"
        }
      },
      "Only system admin can assign host": {
        "zh-CN": {
          "fields": {},
          "message": "只有系统管理员才能制定主机"
        }
      },
      "Cannot migrate with cdrom": {
        "zh-CN": {
          "fields": {},
          "message": "不能在有光盘情况下进行迁移"
        }
      },
      "Not eough storage space on current host": {
        "zh-CN": {
          "fields": {},
          "message": "当前主机没有足够的存储空间"
        }
      },
      "No Disk Info Provided": {
        "zh-CN": {
          "fields": {},
          "message": "缺少磁盘相关参数"
        }
      },
      "Wire {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "二层网络 {0} 未找到"
        }
      },
      "Live migrate only support image fromat qocw2": { //也拼错了
        "zh-CN": {
          "fields": {},
          "message": "在线迁移仅支持镜像为qcow2格式的"
        }
      },
      "Cannot switch OS between {0}-{1}": {
        "zh-CN": {
          "fields": {},
          "message": "重装系统不能切换操作系统 {0} 到 {1}"
        }
      },
      "Cannot live migrate in status {0}": {
        "zh-CN": {
          "fields": {},
          "message": "不能在 {0} 状态下进行迁移"
        }
      },
      "Cannot reset baremetal with active guest": {
        "zh-CN": {
          "fields": {},
          "message": "不能在有活跃的虚拟机状态下重启裸金属服务器"
        }
      },
      "Interface {0} not exists": {
        "zh-CN": {
          "fields": {},
          "message": "网卡 {0} 不存在"
        }
      },
      "Snapshot error: disk index {1} > 0 but disk type is {0}": {
        "zh-CN": {
          "fields": {},
          "message": "非第一块磁盘不能是系统盘"
        }
      },
      "Memory size must be number[+unit], like 256M, 1G or 256": {
        "zh-CN": {
          "fields": {},
          "message": "内存大小必须是数字或者数字[+单位], 例如 256M, 1G 或 256"
        }
      },
      "Disk attach muti guests": {
        "zh-CN": {
          "fields": {},
          "message": "磁盘被挂载到多个虚拟机上"
        }
      },
      "Host {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "主机 {0} 未找到"
        }
      },
      "Cannot create backup with shared storage": {
        "zh-CN": {
          "fields": {},
          "message": "不能在共享存储上创建主备虚拟机"
        }
      }
    }
  },
  "NotImplementedError": {
    "zh-CN": "暂不支持该操作",
    "details": {
      "not implemented": {
        "zh-CN": {
          "fields": {},
          "message": "暂不支持该操作"
        }
      },
      "not implement": {
        "zh-CN": {
          "fields": {},
          "message": "暂不支持该操作"
        }
      },
      "Cannot create VPC in private cloud": {
        "zh-CN": {
          "fields": {},
          "message": "私有云暂不支持创建VPC网络"
        }
      },
      "{0} not supported": {
        "zh-CN": {
          "fields": {},
          "message": "暂不支持 {0} 操作"
        }
      }
    }
  },
  "UserNotFoundError": {
    "zh-CN": "未找到该用户，请查证后重试，如需注册请联系管理员",
    "details": {
      "user not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到指定用户，请更正后重试"
        }
      },
      "user {0} not found": {
        "zh-CN": {
          "fields": {},
          "message": "未找到用户 {0}，请更正后重试"
        }
      }
    }
  },
  "BadGateway": {
    "zh-CN": "网关错误",
    "details": {
      "No login key: No such key login_key": {
        "zh-CN": {
          "fields": {},
          "message": "无法获取密码，可能因同步导致，可尝试【重置密码】设置新密码"
        }
      }
    }
  },
  "InvalidCredentialError": {
    "zh-CN": "认证失败",
    "details": {
      "username/password incorrect": {
        "zh-CN": {
          "fields": {},
          "message": "用户名或密码错误"
        }
      }
    }
  },
  "Other": {
    "zh-CN": "服务异常"
  },
  "PolicyDefinitionError": {
    "zh-CN": "策略错误",
  },
  "TooManyFailedAttempts": {
    "zh-CN": "失败次数过多",
    "details": {
      "authUserByIdentityV3: Authenticate: user locked: TooManyFailedAttempts": {
        "zh-CN": {
          "fields": {},
          "message": "账号已被锁定，请联系管理员"
        }
      }
    }
  },
  "RequireLicenseError": {
    "zh-CN": "OneCloud未激活",
    "details": {
      "no license found": {
        "zh-CN": {
          "fields": {},
          "message": ""
        }
      }
    }
  }
}
