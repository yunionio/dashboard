import numerify from 'numerify'

const BINARY = {
  base: 1024,
  suffixes: ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'],
}

const bps = {
  regexp: /[0\s]Bps/,
  format: function format (value, formatType, roundingFunction, numerify) {
    let output = 0
    let suffix = ' '
    formatType = formatType.replace(/\s?Bps/, '')
    for (let power = 0; power <= BINARY.suffixes.length; power++) {
      const min = Math.pow(BINARY.base, power)
      const max = Math.pow(BINARY.base, power + 1)

      if (value === null || value === 0 || (value >= min && value < max)) {
        suffix += BINARY.suffixes[power]

        if (min > 0) value = value / min

        break
      }
    }

    output = numerify._numberToFormat(value, formatType, roundingFunction)

    return output + suffix
  },
}

numerify.setOptions({ scalePercentBy100: false })
numerify.register('Bps', bps)
export default numerify
