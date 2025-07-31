export default {
  isIPv4: (search) => {
    // const rx = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/
    const rx = /^(\d+\.){3}(\d+)?$/
    return rx.test(search)
  },
  isIPv4AndPort: (search) => {
    const rx = /^(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d{1,5})$/
    return rx.test(search)
  },
  isUUID: (search) => {
    const uuid = /(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^[0-9a-fA-F]{32}$)|(^[0-9a-fA-F]{64}$)/
    return uuid.test(search)
  },
  isNumber: (search) => {
    const num = /^[1-9][0-9]*$/
    return num.test(search)
  },
  isPrefixStr: (search) => {
    const p = /^([0-9]+(\.)){3}([0-9]+(\/[0-9]+)?)?$/
    return p.test(search)
  },
  isMAC: (search) => {
    const p = /^([0-9a-fA-F]{2}[:.-]){5}[0-9a-fA-F]{2}$/
    return p.test(search)
  },
  isIPOrDomain: (search) => {
    const p = /^([0-9]{1,3}\.){3}[0-9]{1,3}$|^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return p.test(search)
  },
}
