import {
  getDevTypeColumn,
  getModelColumn,
  getVendorIdColumn,
  getDeviceIdColumn,
  getHotPluggableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getDevTypeColumn({ vm: this }),
      getModelColumn(),
      getVendorIdColumn(),
      getDeviceIdColumn(),
      getHotPluggableColumn(),
    ]
  },
}
