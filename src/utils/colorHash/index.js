import BKDRHash from './bkdr'

/**
 * Convert RGB Array to HEX
 *
 * @param {Array} RGBArray - [R, G, B]
 * @returns {String} 6 digits hex starting with #
 */
const RGB2HEX = function (RGBArray) {
  let hex = '#'
  RGBArray.forEach(function (value) {
    if (value < 16) {
      hex += 0
    }
    hex += value.toString(16)
  })
  return hex
}

/**
 * Convert HSL to RGB
 *
 * @see {@link http://zh.wikipedia.org/wiki/HSL和HSV色彩空间} for further information.
 * @param {Number} H Hue ∈ [0, 360)
 * @param {Number} S Saturation ∈ [0, 1]
 * @param {Number} L Lightness ∈ [0, 1]
 * @returns {Array} R, G, B ∈ [0, 255]
 */
const HSL2RGB = function (H, S, L) {
  H /= 360

  const q = L < 0.5 ? L * (1 + S) : L + S - L * S
  const p = 2 * L - q

  return [H + 1 / 3, H, H - 1 / 3].map(function (color) {
    if (color < 0) {
      color++
    }
    if (color > 1) {
      color--
    }
    if (color < 1 / 6) {
      color = p + (q - p) * 6 * color
    } else if (color < 0.5) {
      color = q
    } else if (color < 2 / 3) {
      color = p + (q - p) * 6 * (2 / 3 - color)
    } else {
      color = p
    }
    return Math.round(color * 255)
  })
}

function isArray (o) {
  return Object.prototype.toString.call(o) === '[object Array]'
}

/**
 * Color Hash Class
 *
 * @class
 */
export const ColorHash = function (options) {
  options = options || {}

  const LS = [options.lightness, options.saturation].map(function (param) {
    param = param || [0.35, 0.5, 0.65] // note that 3 is a prime
    return isArray(param) ? param.concat() : [param]
  })

  this.L = LS[0]
  this.S = LS[1]

  if (typeof options.hue === 'number') {
    options.hue = { min: options.hue, max: options.hue }
  }
  if (typeof options.hue === 'object' && !isArray(options.hue)) {
    options.hue = [options.hue]
  }
  if (typeof options.hue === 'undefined') {
    options.hue = []
  }
  this.hueRanges = options.hue.map(function (range) {
    return {
      min: typeof range.min === 'undefined' ? 0 : range.min,
      max: typeof range.max === 'undefined' ? 360 : range.max,
    }
  })

  this.hash = options.hash || BKDRHash
}

/**
 * Returns the hash in [h, s, l].
 * Note that H ∈ [0, 360); S ∈ [0, 1]; L ∈ [0, 1];
 *
 * @param {String} str string to hash
 * @returns {Array} [h, s, l]
 */
ColorHash.prototype.hsl = function (str) {
  let H
  let hash = this.hash(str)

  if (this.hueRanges.length) {
    const range = this.hueRanges[hash % this.hueRanges.length]
    const hueResolution = 727 // note that 727 is a prime
    H = ((hash / this.hueRanges.length) % hueResolution) * (range.max - range.min) / hueResolution + range.min
  } else {
    H = hash % 359 // note that 359 is a prime
  }
  hash = parseInt(hash / 360)
  const S = this.S[hash % this.S.length]
  hash = parseInt(hash / this.S.length)
  const L = this.L[hash % this.L.length]

  return [H, S, L]
}

/**
 * Returns the hash in [r, g, b].
 * Note that R, G, B ∈ [0, 255]
 *
 * @param {String} str string to hash
 * @returns {Array} [r, g, b]
 */
ColorHash.prototype.rgb = function (str) {
  const hsl = this.hsl(str)
  return HSL2RGB.apply(this, hsl)
}

/**
 * Returns the hash in hex
 *
 * @param {String} str string to hash
 * @returns {String} hex with #
 */
ColorHash.prototype.hex = function (str) {
  const rgb = this.rgb(str)
  return RGB2HEX(rgb)
}

export default new ColorHash({
  hue: [
    { min: 60, max: 90 },
    { min: 180, max: 210 },
    { min: 270, max: 300 },
  ],
})
