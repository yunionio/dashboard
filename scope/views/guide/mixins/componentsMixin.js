import Cloundacount from '../components/Cloundacount.vue'
import ISO from '../components/ISO.vue'
import Region from '../components/Region'
import Zone from '../components/Zone.vue'
import Wire from '../components/Wire'
import Network from '../components/Network.vue'
import Host from '../components/Host.vue'
import Storage from '../components/Storage'
import ShareStorage from '../components/ShareStorage.vue'

export default {
  name: 'guideComponentsMixin',
  components: {
    Cloundacount, // 云账号
    Iso: ISO, // 镜像
    Region, // 区域
    Zone, // 区域
    Wire, // 二层
    Network, // IP子网
    Host, // 宿主机
    Storage, // 本地存储
    ShareStorage, // 共享存储
  },
}
