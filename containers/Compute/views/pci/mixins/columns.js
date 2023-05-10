import {
  getDevTypeColumn,
  getModelColumn,
  getVendorIdColumn,
  getDeviceIdColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getDevTypeColumn({ vm: this }),
      getModelColumn(),
      getVendorIdColumn(),
      getDeviceIdColumn(),
    ]
  },
}
