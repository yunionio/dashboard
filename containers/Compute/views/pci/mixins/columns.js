import {
  getDevTypeColumn,
  getModelColumn,
  getVendorIdColumn,
  getDeviceIdColumn,
  getHotPluggableColumn,
  getDisableAutoDetectColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getDevTypeColumn({ vm: this }),
      getModelColumn(),
      getVendorIdColumn(),
      getDeviceIdColumn(),
      getHotPluggableColumn({ vm: this }),
      getDisableAutoDetectColumn(),
    ]
  },
}
