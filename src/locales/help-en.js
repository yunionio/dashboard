export default {
  help: {
    cloudregionZone: `
      <h4>Region</h4>
      <p>Region refers to the physical location of the ECS instance. </p>
      <h4>Zone</h4>
      <p>Zone refers to a physical area where electricity and network are independent of each other in the same area. In the same region, the zone and the zone can communicate with each other in the intranet, and the zones can achieve fault isolation.
      If your application requires high disaster tolerance, it is recommended that you deploy cloud server ECS instances in different zones in the same region.
      If your application requires low network latency between instances, it is recommended that you create ECS instances in the same Zone. </p>
    `,
    serverPassword: `
      <h4>Key Pair</h4>
      <p>Log in to the server by setting the Key Pairs</p>
      <h4>Keep image settings</h4>
      <p>Use the original password of the mirror, please make sure you know the original password of the selected mirror. </p>
    `,
    keypairPassword: `
      <h4>Key Pair</h4>
      <p>Log in to the server by setting the Key Pairs</p>
    `,
    imagePassword: `
      <h4>Keep image settings</h4>
      <p>Use the original password of the mirror, please make sure you know the original password of the selected mirror. </p>
    `,
    networkIpSubnets: `
      <p>1. VLAN ID is used for network physical isolation, the default is 1, IP subnets with the same VLAN ID are interoperable, and IP subnets with different VLAN IDs are blocked. </p>
      <p>2. When creating multiple IP subnets, the system automatically assigns names</p>
      <p>E.g. the name is network, add 3 IP subnets</p>
      <p>The names are network0, network1, network2 in sequence. </p>
    `,
    networkPolicy: `
      <p>The default policy is: physical machines are allocated from high addresses, and servers are allocated from low addresses</p>
    `,
    networkDomain: `
      <p>When the system assigns an IP to a host, it will also create a domain name record pointing to the IP. The domain name consists of the host name + the host domain name suffix. E.g.</p>
      <p>The host name is vm01, and the host ip is 192.168.1.1</p>
      <p>The host domain name suffix is 'gh.baidu.com'</p>
      <p>After the host is successfully created, ping vm01.gh.baidu.com will get the ip of vm01</p>
    `,
    cloudaccountSetAutoSyncTime: `
      <div>The minimum time interval is 30 minutes</div>
    `,
    cloudaccountAutoCreateProject: `
      <div>If the project information has been set on the cloud account, we will automatically create a project with the same name as the project on the cloud (if the name is the same as the local project, the system will add "-1" by default)</div>
    `,
    useCasProject: `
      <div>The user is first synchronized to the project with the same name in the system as the CAS (if there is no project, it will be created automatically), if some users in the CAS do not have a project, the default project will be used. </div>
    `,
    useCasRole: `
      <div>When synchronizing users to items in the system, the role with the same name in CAS is preferred, and the default role is used if there is no corresponding role in the system. </div>
    `,
    monitorDashboardOverviewTips: 'Resource overview statistics have cycles, and statistics results will be delayed',
    ipSupplement: 'Please ensure that the IP submitted this time is consistent with the actual IP, and cannot be modified once the submission is successful',
    disable_user_on_import: 'Enable means that the user status is enabled, then the users brought in this time can use the system, if disabled, you can reset it in the user list after the import is successful',
    defaultServerNetwork: 'The server will be assigned an IP address from the IP subnet that belongs to the automatically assigned address pool',
    deleteDiskAtTheSameTime: 'If it is not checked, only the system disk will be deleted. After checking, the mounted data disk will be deleted together with the system disk.',
    shutdownStopCharging: `After shutting down, please pay attention to the following information：<br />
                          * After shutting down, the CPU and memory will be released, and the billing of the CPU and memory will be stopped. The associated hard disk, mirroring, and public network bandwidth (if billing is required) will still be billed<br />
                          * After shutting down, the CPU and memory of the instance will no longer be reserved, so it may fail when the instance is started again. At this point, you can try to start again, or start again at a different time<br />
                          * After the shutdown, the common public IP will be released and cannot be retrieved. It is recommended that you first convert to a flexible public IP before performing the shutdown operation<br />
                          * After shutdown, the elastic public IP will be reserved and will not be released, and no fee will be charged during shutdown<br />
                          * During shutdown, many instances of operations (such as adjusting the configuration, reinstalling the system, etc.) may not be supported. If you need to operate, please perform it after booting.<br />
                          * Some instances that do not support shutdown without charging will continue to be charged normally after shutdown`,
    billNegativeNumberReson: 'Negative numbers in the bill are due to refunds arising, such as early release refunds for annual and monthly machines, refunds following the use of coupons, and refunds for other benefits enjoyed by the account.',
    billCurrentYearFee: 'This year\'s consumption is displayed as the current year\'s expenses on the currently selected date and end date',
    restartNetworkToEffectIp: 'After replacing the IP, you need to restart the network card at the same time to take effect',
  },
}
