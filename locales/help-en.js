export default {
  help: {
    cloudregionZone: `
      <h4>Region</h4>
      <p>Region refers to the physical location of the ECS instance. </p>
      <h4>Availability Zone</h4>
      <p>Availability zone refers to a physical area where electricity and network are independent of each other in the same area. In the same region, the availability zone and the availability zone can communicate with each other in the intranet, and the available zones can achieve fault isolation.
      If your application requires high disaster tolerance, it is recommended that you deploy cloud server ECS instances in different availability zones in the same region.
      If your application requires low network latency between instances, it is recommended that you create ECS instances in the same Availability Zone. </p>
    `,
    serverPassword: `
      <h4>Associated key</h4>
      <p>Log in to the server by setting the SSH key</p>
      <h4>Keep mirroring settings</h4>
      <p>Use the original password of the mirror, please make sure you know the original password of the selected mirror. </p>
    `,
    keypairPassword: `
      <h4>Associated key</h4>
      <p>Log in to the server by setting the SSH key</p>
    `,
    imagePassword: `
      <h4>Keep mirroring settings</h4>
      <p>Use the original password of the mirror, please make sure you know the original password of the selected mirror. </p>
    `,
    networkIpSubnets: `
      <p>1. VLAN ID is used for network physical isolation, the default is 1, IP subnets with the same VLAN ID are interoperable, and IP subnets with different VLAN IDs are blocked. </p>
      <p>2. When creating multiple IP subnets, the system automatically assigns names</p>
      <p>For example: the name is network, add 3 IP subnets</p>
      <p>The names are network0, network1, network2 in sequence. </p>
    `,
    networkPolicy: `
      <p>The default policy is: physical machines are allocated from high addresses, and virtual machines are allocated from low addresses</p>
    `,
    networkDomain: `
      <p>When the system assigns an IP to a host, it will also create a domain name record pointing to the IP. The domain name consists of the host name + the host domain name suffix. For example:</p>
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
    ipSupplement: 'Please ensure that the IP submitted this time is consistent with the actual IP, and cannot be modified once the submission is successful',
    disable_user_on_import: 'Enable means that the user status is enabled, then the users brought in this time can use the system, if disabled, you can reset it in the user list after the import is successful',
    defaultServerNetwork: 'The virtual machine will be assigned an IP address from the IP subnet that belongs to the automatically assigned address pool',
  },
}
