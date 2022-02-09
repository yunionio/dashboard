export default {
  help: {
    cloudregionZone: `
      <h4>地域</h4>
      <p>地域指的是 ECS 实例所在的物理位置。</p>
      <h4>可用区</h4>
      <p>可用区是指在同一地域内，电力和网络互相独立的物理区域。在同一地域内可用区与可用区之间内网互通，可用区之间能做到故障隔离。
      如果您的应用需要较高的容灾能力，建议您将云服务器 ECS 实例部署在同一地域的不同可用区内。
      如果您的应用在实例之间需要较低的网络时延，则建议您将 ECS 实例创建在相同的可用区内。</p>
    `,
    serverPassword: `
      <h4>关联密钥</h4>
      <p>通过设置SSH密钥的方式登录服务器</p>
      <h4>保留镜像设置</h4>
      <p>使用镜像原有密码，请确保您知晓选择镜像的原有密码。</p>
    `,
    keypairPassword: `
      <h4>关联密钥</h4>
      <p>通过设置SSH密钥的方式登录服务器</p>
    `,
    imagePassword: `
      <h4>保留镜像设置</h4>
      <p>使用镜像原有密码，请确保您知晓选择镜像的原有密码。</p>
    `,
    networkIpSubnets: `
      <p>1.VLAN ID用于网络物理隔离，默认1，相同VLAN ID的IP子网互通，不同VLAN ID的IP子网不通。</p>
      <p>2.创建多个IP子网时，系统自动分配名称</p>
      <p>例如：名称为network，增加3个IP子网</p>
      <p>名称依次为network0、network1、network2。</p>
    `,
    networkPolicy: `
      <p>缺省策略为：物理机从高地址分配，虚拟机从低地址分配</p>
    `,
    networkDomain: `
      <p>系统为主机分配IP时，会同时创建一条指向该IP的域名记录，域名由主机名称+主机域名后缀组成。例如：</p>
      <p>主机名称为vm01，主机ip为192.168.1.1</p>
      <p>主机域名后缀为gh.baidu.com</p>
      <p>主机创建成功后，ping vm01.gh.baidu.com就会得到vm01的ip</p>
    `,
    cloudaccountSetAutoSyncTime: `
      <div>最少时间间隔为30分钟</div>
    `,
    cloudaccountAutoCreateProject: `
      <div>若云账号上面已设置项目信息，我们会自动创建与云上项目名称相同的项目（若与本地项目重名，系统默认追加“-1”）</div>
    `,
    useCasProject: `
      <div>优先把用户同步到该系统中与CAS中的同名的项目（没有则会自动创建），如果CAS中某些用户没有项目则会使用默认项目。</div>
    `,
    useCasRole: `
      <div>把用户同步到该系统中的项目时，优先使用CAS中的同名的角色，如果系统中没有对应的角色则会使用默认角色。</div>
    `,
    ipSupplement: '请确保本次提交IP与实际IP一致，一经提交成功无法修改',
    monitorDashboardOverviewTips: '资源概览统计有周期，统计结果会有延迟',
    disable_user_on_import: '启用表示用户状态为启用，则本次带入用户均可使用本系统, 禁用反之，你可以在导入成功后在用户列表重新设置',
    defaultServerNetwork: '将从启用自动调度的IP子网中为虚拟机分配IP地址',
    deleteDiskAtTheSameTime: '未勾选则只删除系统盘，勾选后后挂载的数据盘将和系统盘一起被删除',
    shutdownStopCharging: `关机后，请注意以下信息：<br />
                          * 关机后，将释放CPU、内存，并停止对CPU、内存的计费，所关联硬盘、镜像、公网带宽(如需计费)依然计费<br />
                          * 关机后，实例的 CPU 、内存将不再保留，所以再次启动实例时可能会失败。此时，您可以尝试再次启动，或者换一个时间再次启动<br />
                          * 关机后，普通公网 IP 将被释放不可找回，建议您先转换为弹性公网 IP 后再进行关机操作<br />
                          * 关机后，弹性公网 IP 将被保留，不会被释放，关机期间也不收取费用<br />
                          * 关机期间实例较多操作（如调整配置、重装系统等）可能无法支持，如需操作请开机后进行<br />
                          * 部分不支持关机不收费的实例，关机后继续正常收费`,
    billNegativeNumberReson: '账单中出现负数是因为产生了退款，如包年包月机器提前释放退款、使用优惠券后退款、以及账号享受的其他优惠的退款。',
    billCurrentYearFee: '本年消费展示为当前所选日期截止日期的当年费用',
    restartNetworkToEffectIp: '更换IP后需同时重启网卡才生效',
    billResourceSharedTip: '启用后，将包年包月的资源费用账单分摊到具体使用日期，分摊后总费用 = 按量付费费用 + 包年包月分摊后费用',
  },
}
