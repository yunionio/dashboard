// 全局配置 ant-design-vue
import { Spin } from 'ant-design-vue'

export default {
  autoRegister: false,
  install () {
    // 全局设置 loading icon
    Spin.setDefaultIndicator({
      indicator: h => {
        return <a-icon type="loading" style="font-size: 24px" spin />
      },
    })
  },
}
