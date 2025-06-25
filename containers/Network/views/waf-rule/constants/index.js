import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { arrayToObj } from '@/utils/utils'
import i18n from '@/locales'
import { getRuleConfig } from '../utils'

countries.registerLocale(enLocale)
const names = countries.getNames('en')

export const COUNTRYS = Object.entries(names)
  .map(([key, label]) => ({ key, label }))
  .sort((a, b) => a.label.localeCompare(b.label))

export const IDS = [
  { key: 33554433, label: 'DoS Tool - TLS Signature' },
  { key: 33554434, label: 'Sneakerbot - TLS Signature' },
  { key: 33554436, label: 'Scraping bot - TLS Signature' },
  { key: 33554441, label: 'Golang - TLS Signature' },
  { key: 33554442, label: 'Java - TLS Signature' },
  { key: 33554443, label: 'Python - HTTP Signature' },
  { key: 33554444, label: 'Python - User-agent' },
  { key: 33554445, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554446, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554447, label: 'Sneakerbot - Request Headers' },
  { key: 33554448, label: 'cURL - TLS Signature' },
  { key: 33554450, label: 'Scraping bot - TLS Signature' },
  { key: 33554451, label: 'Python - User-agent' },
  { key: 33554452, label: 'Golang - User-agent' },
  { key: 33554453, label: 'Python - User-agent' },
  { key: 33554454, label: 'Node.js - User-agent' },
  { key: 33554455, label: 'Python - User-agent' },
  { key: 33554456, label: 'Python - User-agent' },
  { key: 33554457, label: 'Headless browser - User-agent' },
  { key: 33554458, label: 'Headless browser - User-agent' },
  { key: 33554459, label: 'SEO Tool User-agent - User-agent' },
  { key: 33554460, label: 'SEO Tool User-agent - User-agent' },
  { key: 33554461, label: 'SEO Tool User-agent - User-agent' },
  { key: 33554463, label: 'SEO Tool User-agent - User-agent' },
  { key: 33554464, label: 'AhrefsBot - User-agent' },
  { key: 33554465, label: 'SemrushBot - User-agent' },
  { key: 33554467, label: 'Java - User-agent' },
  { key: 33554468, label: 'Wget - User-agent' },
  { key: 33554469, label: 'cURL - User-agent' },
  { key: 33554470, label: 'Java - User-agent' },
  { key: 33554471, label: 'Python - TLS Signature' },
  { key: 33554472, label: 'Abnormal request - Request Headers' },
  { key: 33554473, label: 'Abnormal request - Incorrect Browser Headers' },
  { key: 33554474, label: 'Python - TLS Signature' },
  { key: 33554475, label: 'Sneakerbot - TLS Signature' },
  { key: 33554476, label: 'Python - TLS Signature' },
  { key: 33554477, label: 'Python - TLS Signature' },
  { key: 33554478, label: 'Python - TLS Signature' },
  { key: 33554479, label: 'Openssl client - TLS Signature ' },
  { key: 33554480, label: 'Python - TLS Signature' },
  { key: 33554481, label: 'Python - TLS Signature' },
  { key: 33554482, label: 'Python - TLS Signature' },
  { key: 33554484, label: 'Flexget - TLS Signature' },
  { key: 33554485, label: 'Python - TLS Signature' },
  { key: 33554486, label: 'Golang - TLS Signature' },
  { key: 33554487, label: 'Flexget - TLS Signature' },
  { key: 33554488, label: 'Sneakerbot - TLS Signature' },
  { key: 33554489, label: 'Python - TLS Signature' },
  { key: 33554492, label: 'Sneakerbot - TLS Signature' },
  { key: 33554493, label: 'Flexget - TLS Signature' },
  { key: 33554494, label: 'Node.js - TLS Signature' },
  { key: 33554495, label: 'Python - TLS Signature' },
  { key: 33554496, label: '.NET framework - TLS Signature' },
  { key: 33554497, label: 'Sneakerbot - TLS Signature' },
  { key: 33554498, label: 'Golang - TLS Signature' },
  { key: 33554499, label: 'Sneakerbot - TLS Signature' },
  { key: 33554500, label: 'Sneakerbot - TLS Signature' },
  { key: 33554501, label: 'Python - TLS Signature' },
  { key: 33554502, label: 'Windows bot - HTTP Fingerprint' },
  { key: 33554503, label: 'Sneakerbot - Request Headers' },
  { key: 33554505, label: 'Python - TLS Signature' },
  { key: 33554506, label: 'Golang - TLS Signature' },
  { key: 33554507, label: 'Golang - TLS Signature' },
  { key: 33554508, label: 'Java - TLS Signature' },
  { key: 33554509, label: 'Sneakerbot - TLS Signature' },
  { key: 33554510, label: 'Sneakerbot - TLS Signature' },
  { key: 33554511, label: 'Python - TLS Signature' },
  { key: 33554512, label: 'cURL - TLS Signature' },
  { key: 33554513, label: 'Openssl client - TLS Signature' },
  { key: 33554514, label: 'Flexget - TLS Signature' },
  { key: 33554515, label: 'Flexget - TLS Signature' },
  { key: 33554516, label: 'Scraping bot - TLS Signature' },
  { key: 33554517, label: 'Flexget - TLS Signature' },
  { key: 33554518, label: 'Sneakerbot - TLS Signature' },
  { key: 33554519, label: 'Sneakerbot - TLS Signature' },
  { key: 33554520, label: 'Python - TLS Signature ' },
  { key: 33554523, label: 'Flexget - TLS Signature' },
  { key: 33554524, label: 'Flexget - TLS Signature' },
  { key: 33554525, label: 'Sneakerbot - TLS Signature' },
  { key: 33554526, label: 'Node.js - TLS Signature' },
  { key: 33554527, label: 'Golang - TLS Signature' },
  { key: 33554528, label: 'Headless browser - User-agent' },
  { key: 33554529, label: 'Node.js - TLS Signature' },
  { key: 33554530, label: 'Scraping bot - TLS Signature ' },
  { key: 33554531, label: 'Sneakerbot - TLS Signature' },
  { key: 33554532, label: 'cURL - TLS Signature' },
  { key: 33554533, label: 'cURL - TLS Signature' },
  { key: 33554534, label: 'cURL - TLS Signature' },
  { key: 33554535, label: 'cURL - TLS Signature' },
  { key: 33554536, label: 'cURL - TLS Signature' },
  { key: 33554537, label: 'cURL - TLS Signature' },
  { key: 33554538, label: 'cURL - TLS Signature' },
  { key: 33554542, label: 'cURL - TLS Signature' },
  { key: 33554543, label: '.NET framework - TLS Signature ' },
  { key: 33554544, label: 'cURL - TLS Signature' },
  { key: 33554545, label: 'Java - TLS Signature' },
  { key: 33554546, label: 'Java - TLS Signature' },
  { key: 33554547, label: 'Java - TLS Signature' },
  { key: 33554548, label: 'Java - TLS Signature' },
  { key: 33554549, label: 'Windows bot - TLS Signature' },
  { key: 33554550, label: 'Abnormal request - Incorrect Browser Headers' },
  { key: 33554551, label: 'Sneakerbot - TLS Signature' },
  { key: 33554552, label: 'Bad User-agent - User-agent' },
  { key: 33554553, label: 'Flexget - TLS Signature' },
  { key: 33554554, label: 'Python - TLS Signature' },
  { key: 33554555, label: 'Node.js - TLS Signature' },
  { key: 33554556, label: 'Sneakerbot - TLS Signature' },
  { key: 33554557, label: 'Flexget - TLS Signature' },
  { key: 33554558, label: 'Flexget - TLS Signature' },
  { key: 33554561, label: '.NET framework - TLS Signature' },
  { key: 33554562, label: 'Python - TLS Signature' },
  { key: 33554563, label: 'cURL - TLS Signature' },
  { key: 33554564, label: 'Sneakerbot - TLS Signature' },
  { key: 33554565, label: 'Sneakerbot - TLS Signature' },
  { key: 33554566, label: 'Golang - TLS Signature' },
  { key: 33554567, label: 'Sneakerbot - TLS Signature' },
  { key: 33554568, label: 'cURL - TLS Signature' },
  { key: 33554569, label: '.NET framework - TLS Signature' },
  { key: 33554570, label: 'Python - TLS Signature' },
  { key: 33554571, label: 'cURL - HTTP Signature' },
  { key: 33554572, label: 'Sneakerbot - TLS Signature' },
  { key: 33554574, label: 'cURL - TLS Signature' },
  { key: 33554575, label: 'cURL - TLS Signature' },
  { key: 33554576, label: 'cURL - TLS Signature' },
  { key: 33554577, label: 'Python - HTTP Signature' },
  { key: 33554578, label: 'Node.js - HTTP Signature' },
  { key: 33554579, label: 'Java - TLS Signature' },
  { key: 33554580, label: 'Node.js - TLS Signature' },
  { key: 33554582, label: 'Python - TLS Signature' },
  { key: 33554583, label: 'Unclassified bot - Request Headers' },
  { key: 33554584, label: 'SEO Tool User-agent - User-agent' },
  { key: 33554585, label: 'Unclassified bot - Request Headers' },
  { key: 33554586, label: 'Unclassified bot - Request Headers' },
  { key: 33554587, label: 'Unclassified bot - Request Headers' },
  { key: 33554588, label: 'Java - TLS Signature' },
  { key: 33554589, label: 'proxy - TLS Signature' },
  { key: 33554590, label: 'Java - TLS Signature' },
  { key: 33554591, label: 'Java - TLS Signature' },
  { key: 33554595, label: 'Node.js - TLS Signature' },
  { key: 33554596, label: 'Lua - TLS Signature' },
  { key: 33554597, label: 'Python - TLS Signature' },
  { key: 33554598, label: 'php - TLS Signature' },
  { key: 33554599, label: 'Perl - TLS Signature' },
  { key: 33554600, label: 'Wget - TLS Signature' },
  { key: 33554602, label: 'Python - TLS Signature' },
  { key: 33554603, label: 'Python - TLS Signature' },
  { key: 33554604, label: '.NET framework - TLS Signature' },
  { key: 33554605, label: 'cURL - TLS Signature' },
  { key: 33554606, label: 'Node.js - User-agent' },
  { key: 33554607, label: 'Sneakerbot - TLS Signature' },
  { key: 33554608, label: 'Flexget - TLS Signature' },
  { key: 33554609, label: 'Flexget - TLS Signature' },
  { key: 33554610, label: 'Windows bot - TLS Signature ' },
  { key: 33554612, label: 'Python - TLS Signature' },
  { key: 33554613, label: 'Flexget - TLS Signature' },
  { key: 33554614, label: 'Python - TLS Signature' },
  { key: 33554615, label: 'Python - TLS Signature' },
  { key: 33554616, label: 'Python - TLS Signature' },
  { key: 33554617, label: 'Python - TLS Signature' },
  { key: 33554621, label: 'Python - TLS Signature' },
  { key: 33554622, label: 'Wget - TLS Signature' },
  { key: 33554623, label: 'Python - TLS Signature' },
  { key: 33554624, label: 'Sneakerbot - TLS Signature' },
  { key: 33554625, label: 'Python - TLS Signature' },
  { key: 33554626, label: 'Python - TLS Signature' },
  { key: 33554627, label: 'Python - TLS Signature' },
  { key: 33554628, label: 'Node.js - TLS Signature' },
  { key: 33554629, label: 'Node.js - TLS Signature' },
  { key: 33554630, label: 'Node.js - TLS Signature' },
  { key: 33554631, label: 'Windows bot - TLS Signature' },
  { key: 33554632, label: 'PHP - TLS Signature' },
  { key: 33554633, label: 'cURL - TLS Signature' },
  { key: 33554634, label: 'Java - TLS Signature' },
  { key: 33554635, label: 'Golang - TLS Signature' },
  { key: 33554636, label: 'cURL - TLS Signature' },
  { key: 33554637, label: 'Python - TLS Signature' },
  { key: 33554638, label: 'cURL - TLS Signature' },
  { key: 33554639, label: 'cURL - TLS Signature' },
  { key: 33554640, label: 'Node.js - TLS Signature' },
  { key: 33554641, label: 'Node.js - TLS Signature' },
  { key: 33554642, label: 'Ruby - TLS Signature' },
  { key: 33554643, label: 'Python - TLS Signature' },
  { key: 33554644, label: 'Python - TLS Signature' },
  { key: 33554645, label: 'cURL - TLS Signature' },
  { key: 33554646, label: 'Python - TLS Signature' },
  { key: 33554647, label: 'Python - TLS Signature' },
  { key: 33554648, label: '.NET framework - TLS Signature' },
  { key: 33554649, label: 'Python - TLS Signature' },
  { key: 33554650, label: 'Python - TLS Signature' },
  { key: 33554652, label: 'Node.js - TLS Signature' },
  { key: 33554653, label: 'Python - TLS Signature' },
  { key: 33554654, label: 'Unclassified bot - TLS Signature' },
  { key: 33554655, label: 'Ruby - TLS Signature' },
  { key: 33554656, label: 'Python - TLS Signature' },
  { key: 33554657, label: 'Sneakerbot - TLS Signature' },
  { key: 33554658, label: 'Perl - TLS Signature' },
  { key: 33554659, label: 'Python - TLS Signature' },
  { key: 33554660, label: 'Node.js - TLS Signature' },
  { key: 33554661, label: 'Openssl client - TLS Signature' },
  { key: 33554662, label: 'Node.js - TLS Signature' },
  { key: 33554663, label: 'Flexget - TLS Signature' },
  { key: 33554665, label: 'Python - TLS Signature' },
  { key: 33554666, label: 'Python - TLS Signature' },
  { key: 33554669, label: 'Swift - TLS Signature' },
  { key: 33554670, label: 'Node.js - TLS Signature' },
  { key: 33554671, label: 'Java - TLS Signature' },
  { key: 33554672, label: 'Sneakerbot - Request Headers' },
  { key: 33554673, label: 'cURL - TLS Signature' },
  { key: 33554674, label: 'Python - HTTP Signature' },
  { key: 33554675, label: 'Flexget - TLS Signature' },
  { key: 33554676, label: 'Sneakerbot - TLS Signature' },
  { key: 33554677, label: 'Python - TLS Signature' },
  { key: 33554678, label: '.NET framework - TLS Signature' },
  { key: 33554679, label: '.NET framework - TLS Signature' },
  { key: 33554680, label: '.NET framework - TLS Signature' },
  { key: 33554681, label: 'Swift - HTTP Signature' },
  { key: 33554684, label: '.NET framework - TLS Signature' },
  { key: 33554685, label: '.NET framework - TLS Signature' },
  { key: 33554687, label: 'Python - TLS Signature' },
  { key: 33554688, label: '.NET framework - TLS Signature' },
  { key: 33554689, label: 'Python - TLS Signature' },
  { key: 33554690, label: 'Python - TLS Signature' },
  { key: 33554691, label: '.NET framework - TLS Signature' },
  { key: 33554692, label: '.NET framework - TLS Signature' },
  { key: 33554693, label: 'Python - TLS Signature' },
  { key: 33554694, label: 'Openssl client - TLS Signature' },
  { key: 33554695, label: 'Wget - TLS Signature' },
  { key: 33554696, label: 'Python - TLS Signature' },
  { key: 33554697, label: 'Flexget - TLS Signature' },
  { key: 33554698, label: 'Openssl client - TLS Signature' },
  { key: 33554699, label: 'Windows bot - TLS Signature' },
  { key: 33554700, label: 'Sneakerbot - TLS Signature' },
  { key: 33554701, label: 'cURL - TLS Signature' },
  { key: 33554702, label: 'Sneakerbot - TLS Signature' },
  { key: 33554703, label: '.NET framework - TLS Signature' },
  { key: 33554704, label: 'Sneakerbot - TLS Signature' },
  { key: 33554705, label: 'Sneakerbot - Request Headers' },
  { key: 33554706, label: 'Sneakerbot - TLS Signature' },
  { key: 33554707, label: 'Python - TLS Signature' },
  { key: 33554708, label: 'Java - TLS Signature' },
  { key: 33554709, label: 'Flexget - TLS Signature' },
  { key: 33554710, label: 'Flexget - TLS Signature' },
  { key: 33554711, label: 'Flexget - TLS Signature' },
  { key: 33554712, label: 'Flexget - TLS Signature' },
  { key: 33554713, label: 'Flexget - TLS Signature' },
  { key: 33554714, label: 'Sneakerbot - TLS Signature' },
  { key: 33554715, label: 'Sneakerbot - TLS Signature' },
  { key: 33554716, label: 'Flexget - TLS Signature' },
  { key: 33554717, label: 'Java - TLS Signature' },
  { key: 33554718, label: 'Sneakerbot - TLS Signature' },
  { key: 33554719, label: 'Sneakerbot - Request Headers' },
  { key: 33554720, label: 'Flexget - TLS Signature' },
  { key: 33554721, label: 'Sneakerbot - TLS Signature' },
  { key: 33554723, label: 'Python - TLS Signature' },
  { key: 33554724, label: 'Sneakerbot - TLS Signature' },
  { key: 33554725, label: 'Sneakerbot - TLS Signature' },
  { key: 33554726, label: 'Sneakerbot - Request Headers' },
  { key: 33554727, label: 'Sneakerbot - Request Headers' },
  { key: 33554728, label: 'Sneakerbot - Request Headers' },
  { key: 33554729, label: 'Sneakerbot - Request Headers' },
  { key: 33554730, label: 'Sneakerbot - Request Headers' },
  { key: 33554731, label: 'Golang - TLS Signature' },
  { key: 33554732, label: 'Sneakerbot - TLS Signature' },
  { key: 33554733, label: 'Sneakerbot - TLS Signature' },
  { key: 33554734, label: 'Sneakerbot - TLS Signature' },
  { key: 33554735, label: 'Sneakerbot - TLS Signature' },
  { key: 33554736, label: '.NET framework - TLS Signature' },
  { key: 33554738, label: 'cURL - TLS Signature' },
  { key: 33554739, label: 'Sneakerbot - TLS Signature' },
  { key: 33554740, label: 'Sneakerbot - TLS Signature' },
  { key: 33554741, label: 'Sneakerbot - TLS Signature' },
  { key: 33554742, label: 'Flexget - TLS Signature' },
  { key: 33554743, label: 'Flexget - TLS Signature' },
  { key: 33554744, label: 'Sneakerbot - TLS Signature' },
  { key: 33554745, label: 'Sneakerbot - TLS Signature' },
  { key: 33554746, label: 'Sneakerbot - Request Headers' },
  { key: 33554747, label: 'Sneakerbot - TLS Signature' },
  { key: 33554748, label: 'Sneakerbot - TLS Signature' },
  { key: 33554749, label: 'Sneakerbot - TLS Signature' },
  { key: 33554750, label: 'Sneakerbot - TLS Signature' },
  { key: 33554751, label: 'Sneakerbot - Request Headers' },
  { key: 33554752, label: 'Python - TLS Signature' },
  { key: 33554753, label: 'Sneakerbot - TLS Signature' },
  { key: 33554754, label: 'Sneakerbot - TLS Signature' },
  { key: 33554755, label: 'Sneakerbot - TLS Signature' },
  { key: 33554757, label: 'Sneakerbot - TLS Signature' },
  { key: 33554759, label: 'Sneakerbot - TLS Signature' },
  { key: 33554760, label: 'Sneakerbot - TLS Signature' },
  { key: 33554761, label: 'Sneakerbot - TLS Signature' },
  { key: 33554762, label: 'Sneakerbot - TLS Signature' },
  { key: 33554763, label: 'Sneakerbot - TLS Signature' },
  { key: 33554764, label: 'Sneakerbot - TLS Signature' },
  { key: 33554765, label: 'Unclassified bot - TLS Signature ' },
  { key: 33554766, label: 'Sneakerbot - TLS Signature' },
  { key: 33554767, label: 'Flexget - TLS Signature' },
  { key: 33554768, label: 'Flexget - TLS Signature' },
  { key: 33554769, label: 'Flexget - TLS Signature' },
  { key: 33554770, label: 'Sneakerbot - TLS Signature' },
  { key: 33554771, label: 'Sneakerbot - TLS Signature' },
  { key: 33554772, label: 'Sneakerbot - TLS Signature' },
  { key: 33554773, label: 'Sneakerbot - TLS Signature' },
  { key: 33554774, label: 'cURL - TLS Signature' },
  { key: 33554775, label: 'Python - TLS Signature' },
  { key: 33554776, label: 'Node.js - TLS Signature' },
  { key: 33554777, label: 'Sneakerbot - TLS Signature' },
  { key: 33554778, label: 'Sneakerbot - TLS Signature' },
  { key: 33554779, label: 'Sneakerbot - TLS Signature' },
  { key: 33554780, label: 'Sneakerbot - Request Headers' },
  { key: 33554781, label: 'Sneakerbot - TLS Signature' },
  { key: 33554782, label: 'ATO Bot - Request Headers' },
  { key: 33554783, label: 'Sneakerbot - TLS Signature' },
  { key: 33554786, label: 'Unclassified bot - TLS Signature' },
  { key: 33554787, label: 'Unclassified bot - TLS Signature' },
  { key: 33554788, label: 'Unclassified bot - TLS Signature' },
  { key: 33554789, label: 'Sneakerbot - TLS Signature' },
  { key: 33554790, label: 'Sneakerbot - TLS Signature' },
  { key: 33554791, label: 'Sneakerbot - TLS Signature' },
  { key: 33554792, label: '.NET framework - TLS Signature' },
  { key: 33554793, label: 'Python - TLS Signature' },
  { key: 33554794, label: '.NET framework - TLS Signature' },
  { key: 33554795, label: 'ATO Bot - Request Headers' },
  { key: 33554796, label: 'Python - TLS Signature' },
  { key: 33554797, label: 'Python - TLS Signature' },
  { key: 33554798, label: 'Sneakerbot - TLS Signature' },
  { key: 33554801, label: 'ATO Bot - TLS Signature' },
  { key: 33554802, label: 'Node.js - TLS Signature' },
  { key: 33554803, label: '.NET framework - TLS Signature' },
  { key: 33554804, label: 'ATO Bot - TLS Signature' },
  { key: 33554805, label: 'Vulnerability scanner - TLS Signature' },
  { key: 33554806, label: 'cURL - TLS Signature' },
  { key: 33554807, label: 'Node.js - TLS Signature ' },
  { key: 33554808, label: 'Openssl client - TLS Signature' },
  { key: 33554809, label: '.NET framework - TLS Signature ' },
  { key: 33554810, label: 'Sneakerbot - TLS Signature' },
  { key: 33554811, label: 'Scraping bot - TLS Signature' },
  { key: 33554812, label: 'Java - TLS Signature ' },
  { key: 33554813, label: 'Java - TLS Signature ' },
  { key: 33554814, label: 'Java - TLS Signature ' },
  { key: 33554815, label: 'Java - TLS Signature' },
  { key: 33554816, label: 'Java - TLS Signature' },
  { key: 33554817, label: 'cURL - User-agent' },
  { key: 33554818, label: 'Java - TLS Signature ' },
  { key: 33554819, label: 'Java - TLS Signature ' },
  { key: 33554820, label: 'Java - TLS Signature' },
  { key: 33554821, label: 'Java - TLS Signature' },
  { key: 33554822, label: 'Openssl client - TLS Signature' },
  { key: 33554823, label: 'Node.js - TLS Signature' },
  { key: 33554824, label: 'Java - TLS Signature ' },
  { key: 33554826, label: 'Java - TLS Signature ' },
  { key: 33554827, label: 'Java - TLS Signature ' },
  { key: 33554828, label: 'Java - TLS Signature' },
  { key: 33554829, label: 'Java - TLS Signature' },
  { key: 33554830, label: 'Java - TLS Signature' },
  { key: 33554831, label: 'Okhttp bot - TLS Signature' },
  { key: 33554832, label: 'Okhttp bot - TLS Signature' },
  { key: 33554833, label: 'Perl - TLS Signature' },
  { key: 33554834, label: 'Sneakerbot - TLS Signature' },
  { key: 33554835, label: 'Sneakerbot - TLS Signature' },
  { key: 33554836, label: 'Java - TLS Signature ' },
  { key: 33554837, label: 'Java - TLS Signature ' },
  { key: 33554838, label: 'Java - TLS Signature ' },
  { key: 33554839, label: 'Java - TLS Signature' },
  { key: 33554841, label: 'Sneakerbot - TLS Signature' },
  { key: 33554842, label: 'Sneakerbot - TLS Signature' },
  { key: 33554843, label: 'Windows bot - TLS Signature' },
  { key: 33554844, label: 'cURL - TLS Signature ' },
  { key: 33554845, label: 'Java - TLS Signature' },
  { key: 33554846, label: 'Windows bot - TLS Signature' },
  { key: 33554847, label: 'Windows bot - TLS Signature' },
  { key: 33554848, label: 'ATO Bot - TLS Signature' },
  { key: 33554849, label: 'Sneakerbot - TLS Signature ' },
  { key: 33554850, label: 'Windows bot - TLS Signature ' },
  { key: 33554851, label: 'Unclassified bot - TLS Signature ' },
  { key: 33554852, label: 'ATO Bot - Request Headers' },
  { key: 33554853, label: 'Windows bot - TLS Signature' },
  { key: 33554854, label: 'ATO Bot - TLS Signature ' },
  { key: 33554856, label: 'Python - TLS Signature' },
  { key: 33554857, label: 'Python - TLS Signature' },
  { key: 33554858, label: 'Python - TLS Signature' },
  { key: 33554859, label: 'Python - TLS Signature' },
  { key: 33554860, label: 'Python - TLS Signature' },
  { key: 33554861, label: 'Python - TLS Signature' },
  { key: 33554862, label: 'Python - TLS Signature' },
  { key: 33554863, label: 'Python - TLS Signature' },
  { key: 33554864, label: 'Mobile app imitator - TLS Signature' },
  { key: 33554865, label: 'Mobile app imitator - TLS Signature' },
  { key: 33554866, label: 'Vulnerability scanner - TLS Signature' },
  { key: 33554867, label: 'Vulnerability scanner - TLS Signature' },
  { key: 33554868, label: 'ATO Bot - TLS Signature ' },
  { key: 33554869, label: 'Python - TLS Signature' },
  { key: 33554871, label: 'cURL - TLS Signature' },
  { key: 33554872, label: 'Sneakerbot - TLS Signature' },
  { key: 33554873, label: 'Sneakerbot - TLS Signature' },
  { key: 33554874, label: 'Python - TLS Signature' },
  { key: 33554875, label: 'Unclassified bot - TLS Signature' },
  { key: 33554876, label: 'ATO Bot - TLS Signature' },
  { key: 33554877, label: 'Sneakerbot - TLS Signature ' },
  { key: 33554879, label: 'Sneakerbot - TLS Signature ' },
  { key: 33554881, label: 'Erlang - TLS Signature' },
  { key: 33554882, label: 'Vulnerability scanner - TLS Signature ' },
  { key: 33554883, label: 'ATO Bot - Request Headers' },
  { key: 33554884, label: 'php - TLS Signature' },
  { key: 33554885, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554886, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554888, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554889, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554890, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554891, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554892, label: 'Browser imitator - Incorrect Browser Headers' },
  { key: 33554893, label: 'ATO Bot - Request Headers' },
  { key: 33554896, label: 'ATO Bot - Request Headers' },
  { key: 33554897, label: '.NET framework - TLS Signature' },
  { key: 33554898, label: 'Erlang - TLS Signature ' },
  { key: 33554899, label: 'Java - TLS Signature ' },
  { key: 33554901, label: 'zennoposter - TLS Signature' },
  { key: 33554902, label: 'ATO Bot - TLS Signature' },
  { key: 33554903, label: 'ATO Bot - TLS Signature' },
  { key: 33554905, label: 'ATO Bot - TLS Signature' },
  { key: 33554907, label: 'bitcomet - TLS Signature' },
  { key: 33554908, label: 'bitcomet - TLS Signature' },
  { key: 33554909, label: 'Mobile app imitator - Request Headers' },
  { key: 33554910, label: 'Mobile app imitator - Request Headers' },
  { key: 33554911, label: '.NET framework - TLS Signature' },
  { key: 33554912, label: 'Unclassified bot - TLS Signature' },
  { key: 33554913, label: 'Empty User-agent - User-agent' },
  { key: 33554914, label: 'adware - Incorrect Browser Headers' },
  { key: 33554915, label: 'Header format - Incorrect Browser Headers' },
  { key: 33554916, label: 'Header format - Incorrect Browser Headers' },
  { key: 33554917, label: 'Header format - Incorrect Browser Headers' },
  { key: 33554918, label: 'Abnormal request - Incorrect Browser Headers' },
  { key: 33554919, label: 'Java - TLS Signature ' },
  { key: 33554925, label: 'Unclassified bot - TLS Signature' },
  { key: 33554926, label: 'Unclassified bot - HTTP Signature' },
  { key: 33554927, label: 'DoS Tool - TLS Signature ' },
  { key: 33554928, label: 'cURL - HTTP Signature' },
  { key: 33554936, label: 'Java - HTTP Signature' },
  { key: 33554958, label: 'Unclassified bot - TLS Signature ' },
  { key: 33554975, label: 'Unclassified bot - TLS Signature' },
  { key: 33555007, label: 'ATO Bot - HTTP Signature' },
  { key: 33555060, label: 'Python - User-agent' },
  { key: 33555069, label: 'Unclassified bot - TLS Signature' },
  { key: 33555071, label: 'Unclassified bot - HTTP Signature' },
  { key: 33555072, label: 'Unclassified bot - TLS Signature' },
  { key: 33555413, label: 'Python - HTTP Signature' },
  { key: 33555516, label: 'Golang - HTTP Signature' },
  { key: 33555525, label: 'Golang - HTTP Signature' },
  { key: 33555568, label: 'Unclassified bot - Request Headers' },
  { key: 33555963, label: 'Python - HTTP Signature' },
  { key: 33555965, label: 'Node.js - HTTP Signature' },
  { key: 33558213, label: 'Python - TLS Signature ' },
  { key: 33558685, label: 'Java - User-agent' },
  { key: 33558687, label: 'Node.js - User-agent' },
  { key: 33558689, label: 'Golang - User-agent' },
  { key: 33558691, label: 'Golang - User-agent' },
  { key: 33558693, label: 'Golang - User-agent' },
  { key: 33558695, label: 'php - User-agent' },
  { key: 33558697, label: 'Erlang - User-agent' },
  { key: 33558699, label: 'Python - User-agent' },
  { key: 33558701, label: 'Rust - User-agent' },
  { key: 33558703, label: '.NET framework - User-agent' },
  { key: 33558705, label: 'Scraping bot - User-agent' },
  { key: 33558707, label: 'Node.js - User-agent' },
  { key: 33558709, label: 'Perl - User-agent' },
  { key: 33558711, label: 'Python - User-agent' },
  { key: 33558713, label: 'Perl - User-agent' },
  { key: 33558715, label: 'Headless browser - User-agent' },
  { key: 33558717, label: 'Node.js - User-agent' },
  { key: 33558719, label: 'powershell - User-agent' },
  { key: 33558721, label: 'Rust - User-agent' },
  { key: 33560491, label: 'Unclassified bot - TLS Signature ' },
  { key: 33560493, label: 'Unclassified bot - TLS Signature ' },
  { key: 33561985, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563685, label: 'cURL - TLS Signature ' },
  { key: 33563687, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563720, label: 'cURL - User-agent' },
  { key: 33563722, label: 'Scraping bot - HTTP Signature' },
  { key: 33563724, label: 'ATO Bot - HTTP Signature' },
  { key: 33563790, label: 'Rust - TLS Signature' },
  { key: 33563794, label: 'Java - TLS Signature' },
  { key: 33563796, label: 'Noble TLS - TLS Signature' },
  { key: 33563798, label: 'cURL - User-agent' },
  { key: 33563831, label: 'Python - TLS Signature ' },
  { key: 33563833, label: 'Golang - TLS Signature ' },
  { key: 33563835, label: 'Python - TLS Signature ' },
  { key: 33563837, label: 'Golang - User-agent' },
  { key: 33563839, label: 'SEO Tool User-agent - User-agent' },
  { key: 33563841, label: 'AI Bot - User-agent' },
  { key: 33563843, label: 'AI Bot - User-agent' },
  { key: 33563845, label: 'apple - User-agent' },
  { key: 33563847, label: 'AI Bot - User-agent' },
  { key: 33563849, label: 'AI Bot - User-agent' },
  { key: 33563851, label: 'AI Bot - User-agent' },
  { key: 33563853, label: 'AI Bot - User-agent' },
  { key: 33563855, label: 'AI Bot - User-agent' },
  { key: 33563857, label: 'AI Bot - User-agent' },
  { key: 33563859, label: 'AI Bot - User-agent' },
  { key: 33563861, label: 'AI Bot - User-agent' },
  { key: 33563863, label: 'AI Bot - User-agent' },
  { key: 33563865, label: 'SEO Tool User-agent - User-agent' },
  { key: 33563867, label: 'AI Bot - User-agent' },
  { key: 33563869, label: 'AI Bot - User-agent' },
  { key: 33563871, label: 'Golang - User-agent' },
  { key: 33563873, label: 'Golang - User-agent' },
  { key: 33563875, label: 'AI Bot - User-agent' },
  { key: 33563877, label: 'AI Bot - User-agent' },
  { key: 33563879, label: 'Data bot - User-agent' },
  { key: 33563881, label: 'AI Bot - User-agent' },
  { key: 33563883, label: 'AI Bot - User-agent' },
  { key: 33563885, label: 'AI Bot - User-agent' },
  { key: 33563887, label: 'Data bot - User-agent' },
  { key: 33563889, label: 'AI Bot - User-agent' },
  { key: 33563891, label: 'AI Bot - User-agent' },
  { key: 33563893, label: 'AI Bot - User-agent' },
  { key: 33563895, label: 'AI Bot - User-agent' },
  { key: 33563897, label: 'AI Bot - User-agent' },
  { key: 33563899, label: 'AI Bot - User-agent' },
  { key: 33563901, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563903, label: 'Java - TLS Signature ' },
  { key: 33563905, label: 'Java - TLS Signature ' },
  { key: 33563907, label: 'Vulnerability scanner - User-agent' },
  { key: 33563914, label: 'Python - TLS Signature ' },
  { key: 33563916, label: 'Python - TLS Signature ' },
  { key: 33563918, label: 'Python - TLS Signature ' },
  { key: 33563920, label: 'Vulnerability scanner - User-agent' },
  { key: 33563922, label: 'Python - TLS Signature ' },
  { key: 33563924, label: 'Python - TLS Signature ' },
  { key: 33563926, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563928, label: 'Scraping Bot - TLS Signature ' },
  { key: 33563930, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563932, label: 'Python - TLS Signature ' },
  { key: 33563965, label: 'Headless browser - TLS Signature ' },
  { key: 33563967, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563970, label: 'AI Bot - User-agent' },
  { key: 33563972, label: 'AI Bot - User-agent' },
  { key: 33563974, label: 'AI Bot - User-agent' },
  { key: 33563976, label: 'AI Bot - User-agent' },
  { key: 33563978, label: 'AI Bot - User-agent' },
  { key: 33563980, label: 'AI Bot - User-agent' },
  { key: 33563982, label: 'AI Bot - User-agent' },
  { key: 33563984, label: 'AI Bot - User-agent' },
  { key: 33563986, label: 'AI Bot - User-agent' },
  { key: 33563988, label: 'Scraping bot - TLS Signature ' },
  { key: 33563990, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563992, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563994, label: 'Unclassified bot - TLS Signature ' },
  { key: 33563996, label: 'Python - TLS Signature ' },
  { key: 33563998, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564000, label: 'Unclassified bot - TLS Signature' },
  { key: 33564002, label: 'Unclassified bot - TLS Signature' },
  { key: 33564033, label: 'AI Bot - User-agent' },
  { key: 33564035, label: 'AI Bot - User-agent' },
  { key: 33564037, label: 'AI Bot - User-agent' },
  { key: 33564039, label: 'AI Bot - User-agent' },
  { key: 33564041, label: 'AI Bot - User-agent' },
  { key: 33564043, label: 'AI Bot - User-agent' },
  { key: 33564045, label: 'AI Bot - User-agent' },
  { key: 33564047, label: 'AI Bot - User-agent' },
  { key: 33564049, label: 'AI Bot - User-agent' },
  { key: 33564051, label: 'AI Bot - User-agent' },
  { key: 33564053, label: 'AI Bot - User-agent' },
  { key: 33564055, label: 'AI Bot - User-agent' },
  { key: 33564057, label: 'AI Bot - User-agent' },
  { key: 33564059, label: 'Python - TLS Signature ' },
  { key: 33564061, label: 'cURL - TLS Signature ' },
  { key: 33564063, label: 'Java - TLS Signature ' },
  { key: 33564065, label: 'Java - TLS Signature ' },
  { key: 33564067, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564069, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564071, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564073, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564075, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564077, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564112, label: 'Python - TLS Signature ' },
  { key: 33564114, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564116, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564118, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564120, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564122, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564124, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564126, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564128, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564130, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564132, label: 'AI Bot - User-agent' },
  { key: 33564134, label: 'Rust - User-agent' },
  { key: 33564137, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564139, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564141, label: 'Golang - TLS Signature ' },
  { key: 33564143, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564145, label: 'Golang - TLS Signature ' },
  { key: 33564147, label: 'Node.js - TLS Signature ' },
  { key: 33564149, label: 'Golang - TLS Signature ' },
  { key: 33564151, label: 'Golang - TLS Signature ' },
  { key: 33564153, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564155, label: 'cURL - TLS Signature ' },
  { key: 33564157, label: 'cURL - HTTP Signature' },
  { key: 33564159, label: 'cURL - TLS Signature' },
  { key: 33564161, label: 'Java - TLS Signature ' },
  { key: 33564163, label: 'Sneakerbot - TLS Signature ' },
  { key: 33564165, label: 'Sneakerbot - HTTP Signature' },
  { key: 33564167, label: 'Sneakerbot - TLS Signature ' },
  { key: 33564169, label: 'Sneakerbot - TLS Signature ' },
  { key: 33564171, label: 'Sneakerbot - TLS Signature ' },
  { key: 33564173, label: 'Sneakerbot - TLS Signature ' },
  { key: 33564175, label: 'Sneakerbot - TLS Signature ' },
  { key: 33564178, label: 'Sneakerbot - TLS Signature ' },
  { key: 33564180, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564182, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564184, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564186, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564188, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564190, label: 'Python - TLS Signature ' },
  { key: 33564192, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564194, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564196, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564198, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564200, label: 'Vulnerability scanner - User-agent' },
  { key: 33564202, label: 'Vulnerability scanner - User-agent' },
  { key: 33564205, label: 'Python - TLS Signature ' },
  { key: 33564207, label: 'Java - TLS Signature ' },
  { key: 33564209, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564213, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564215, label: 'Vulnerability scanner - User-agent' },
  { key: 33564217, label: 'Scraping bot - HTTP Signature' },
  { key: 33564219, label: 'Unclassified bot - TLS Signature ' },
  { key: 33564221, label: 'Golang - TLS Signature ' },
  { key: 33564223, label: 'DoS Tool - TLS Signature ' },
  { key: 33564225, label: 'DoS Tool - HTTP Signature' },
  { key: 50331648, label: 'ASN Anomaly' },
  { key: 50331649, label: 'TLS Signature Anomaly' },
  { key: 50331650, label: 'IP Anomaly' },
  { key: 117452381, label: 'Bing Ads - Verified bot' },
  { key: 117461756, label: 'HIFIBot - Verified bot' },
  { key: 117468859, label: 'WPMU DEV Broken Link Checker - Verified bot' },
  { key: 117475723, label: 'Slickstream - Verified bot' },
  { key: 117479730, label: 'BingBot - Verified bot' },
  { key: 117497732, label: 'Retool - Verified bot' },
  { key: 117517650, label: 'Cert Chief - Verified bot' },
  { key: 117617846, label: 'UptimeRobot - Verified bot' },
  { key: 117646504, label: 'ImpactitAutomatedTestSuite - Verified bot' },
  { key: 117654846, label: 'Google-PageRenderer - Verified bot' },
  { key: 117713511, label: 'EzoicBot - Verified bot' },
  { key: 117822238, label: 'Google Site Verification - Verified bot' },
  { key: 117825325, label: 'Cisco Umbrella - Verified bot' },
  { key: 117910511, label: 'Reward Gateway - Verified bot' },
  { key: 117944015, label: 'Yokoy Group Webhooks - Verified bot' },
  { key: 117968389, label: 'PWABuilder - Verified bot' },
  { key: 117991028, label: 'WMF Zotero Translation Server - Verified bot' },
  { key: 118017649, label: 'Swifteq Link Checker - Verified bot' },
  { key: 118029263, label: 'logicmonitor - Verified bot' },
  { key: 118035830, label: 'Sucuri - Verified bot' },
  { key: 118039197, label: 'Google AdsBot - Verified bot' },
  { key: 118137613, label: 'Acquia optimize (Monsido) - Verified bot' },
  { key: 118138532, label: 'Innologica - Verified bot' },
  { key: 118139771, label: 'Awario - Verified bot' },
  { key: 118145000, label: 'Prerender - Verified bot' },
  { key: 118152435, label: 'Google Images - Verified bot' },
  { key: 118180334, label: 'YandexBot - Verified bot' },
  { key: 118196635, label: 'Sogou - Verified bot' },
  { key: 118273969, label: 'Site24x7 - Verified bot' },
  { key: 118342630, label: 'Brandwatch - Verified bot' },
  { key: 118375885, label: 'PrintFriendly - Verified bot' },
  { key: 118395543, label: 'WebTotemBot - Verified bot' },
  { key: 118399871, label: 'Instapaper - Verified bot' },
  { key: 118536588, label: 'Coveo Bot - Verified bot' },
  { key: 118549552, label: 'Doctom Monitor - Verified bot' },
  { key: 118580393, label: 'Mediavine Medatada Parser - Verified bot' },
  { key: 118597781, label: 'UptimeBot - Verified bot' },
  { key: 118601807, label: 'Amazonbot - Verified bot' },
  { key: 118652724, label: 'Prisma Access - Verified bot' },
  { key: 118692916, label: 'Oh Dear - Verified bot' },
  { key: 118731042, label: 'PayPal - Verified bot' },
  { key: 118746560, label: 'Watchful - Verified bot' },
  { key: 118825126, label: 'Rakuten Image extraction bot - Verified bot' },
  { key: 118840746, label: 'Apple App Site Association - Verified bot' },
  { key: 118841730, label: 'Cloudflare Purge - Verified bot' },
  { key: 118860079, label: 'OurFamilyWizard - Verified bot' },
  { key: 118883123, label: 'SEO Audit Check Bot - Verified bot' },
  { key: 118942125, label: 'FullStory - Verified bot' },
  { key: 118968267, label: 'ICC Crawler - Verified bot' },
  { key: 118976501, label: 'Yeti by Naver - Verified bot' },
  { key: 119101331, label: 'Alexa Archive - Verified bot' },
  { key: 119161837, label: 'SkroutzBot - Verified bot' },
  { key: 119230104, label: 'AddSearchBot - Verified bot' },
  { key: 119240037, label: 'Macrobondbot - Verified bot' },
  { key: 119249190, label: 'Grapeshot - Verified bot' },
  { key: 119256804, label: 'NewsBlur - Verified bot' },
  { key: 119357029, label: 'Cookiebot - Verified bot' },
  { key: 119386758, label: 'Google Digital Asset Links - Verified bot' },
  { key: 119430691, label: 'Drata Autopilot - Verified bot' },
  { key: 119451472, label: 'LingueeBot - Verified bot' },
  { key: 119468898, label: 'SmartologyBot - Verified bot' },
  { key: 119708667, label: 'kb.dk_bot - Verified bot' },
  { key: 119741217, label: 'SE Ranking Bot - Verified bot' },
  { key: 119742680, label: 'LinkedInBot - Verified bot' },
  { key: 119743017, label: 'SendGrid - Verified bot' },
  { key: 119769752, label: 'ClearscopeBot - Verified bot' },
  { key: 119770846, label: 'Reelevant - Verified bot' },
  { key: 119777256, label: 'Marginalia Search - Verified bot' },
  { key: 119802998, label: 'Jetpack - Verified bot' },
  { key: 119851305, label: 'RetroListeCOM - Verified bot' },
  { key: 119862967, label: 'Twilio Proxy - Verified bot' },
  { key: 119889021, label: 'Semrushbot - Verified bot' },
  { key: 119913775, label: 'Jumio - Verified bot' },
  { key: 119931746, label: 'Limber.IO - Verified bot' },
  { key: 119945317, label: 'Buttondown RSS-Feed-Parser - Verified bot' },
  { key: 120007959, label: 'Google Scholar - Verified bot' },
  { key: 120079405, label: 'Bling ERP - Verified bot' },
  { key: 120080928, label: 'CopyMeThatBot - Verified bot' },
  { key: 120103501, label: 'Gigabot - Verified bot' },
  { key: 120176742, label: 'PerplexityBot - Verified bot' },
  { key: 120216569, label: 'EasyCron - Verified bot' },
  { key: 120228091, label: 'WPMUDEV Uptime Monitor 5.0 - Verified bot' },
  { key: 120293842, label: 'Modular DS - Verified bot' },
  { key: 120405226, label: 'Orlo Link Preview - Verified bot' },
  { key: 120424214, label: 'Applebot - Verified bot' },
  { key: 120426845, label: 'Freshping - Verified bot' },
  { key: 120512708, label: 'EasyBill Import Manager - Verified bot' },
  { key: 120543530, label: 'Opengraph Bot - Verified bot' },
  { key: 120575366, label: 'Steam Chat - Verified bot' },
  { key: 120580905, label: 'BigUpData Bot - Verified bot' },
  { key: 120602561, label: 'Google Publisher Center - Verified bot' },
  { key: 120617850, label: 'Google-AdWords-Express - Verified bot' },
  { key: 120618378, label: 'ActiveComply Bot - Verified bot' },
  { key: 120623194, label: 'GoogleBot - Verified bot' },
  { key: 120711141, label: 'deadlinkchecker - Verified bot' },
  { key: 120776641, label: 'BrightEdge Bot - Verified bot' },
  { key: 120846254, label: 'Cloudflare Digicert DCV - Verified bot' },
  { key: 120850273, label: 'Google API - Verified bot' },
  { key: 120888980, label: 'Cloudtrellis - Verified bot' },
  { key: 120911716, label: 'LinkChecker Bot - Verified bot' },
  { key: 120938397, label: 'UCSD Sysnet Academic Crawler - Verified bot' },
  { key: 120981230, label: 'Google Schema Markup Testing Tool - Verified bot' },
  { key: 120992776, label: 'Daum - Verified bot' },
  { key: 120997678, label: 'Stripe - Verified bot' },
  { key: 121018068, label: 'Datenbank Crawler - Verified bot' },
  { key: 121130486, label: 'Microsoft Preview - Verified bot' },
  { key: 121141878, label: 'Kagi Bot - Verified bot' },
  { key: 121165033, label: 'Potions - Verified bot' },
  { key: 121186013, label: 'Skroutz ImageBot - Verified bot' },
  { key: 121194612, label: 'Loomly Bot - Verified bot' },
  { key: 121229731, label: 'Pulsetic - Verified bot' },
  { key: 121349130, label: 'Yahoo Link Preview - Verified bot' },
  { key: 121451232, label: 'Ahrefs Site Audit - Verified bot' },
  { key: 121548236, label: 'Make Platform - Verified bot' },
  { key: 121577532, label: 'Google Safety - Verified bot' },
  { key: 121618595, label: 'Facebook - Verified bot' },
  { key: 121639301, label: 'Linespider - Verified bot' },
  { key: 121797637, label: 'Jagged Pixel UptimeBot - Verified bot' },
  { key: 121899484, label: 'videootv Bot - Verified bot' },
  { key: 121952577, label: 'Witness Ai - Verified bot' },
  { key: 121963421, label: 'Mojeek - Verified bot' },
  { key: 121972032, label: 'NixStatsMonitoringBot - Verified bot' },
  { key: 122006524, label: 'ConvermaxBot - Verified bot' },
  { key: 122050264, label: 'HubSpot Feed Fetcher - Verified bot' },
  { key: 122069580, label: 'Amazon AdBot - Verified bot' },
  { key: 122089013, label: 'Onetrust CMP Scanner - Verified bot' },
  { key: 122096514, label: 'Termly - Verified bot' },
  { key: 122103746, label: 'Online Webceo Bot - Verified bot' },
  { key: 122124699, label: 'Splunk - Verified bot' },
  { key: 122141928, label: 'FoxBot - Verified bot' },
  { key: 122153532, label: 'Baidu ADS Server Proxy - Verified bot' },
  { key: 122184053, label: 'Qwantbot - Verified bot' },
  { key: 122188770, label: 'Cloudflare Custom Hostname Verification - Verified bot' },
  { key: 122188945, label: 'MirrorWebCrawler - Verified bot' },
  { key: 122208228, label: 'Google Inspection Tool - Verified bot' },
  { key: 122222118, label: 'Collapsify - Verified bot' },
  { key: 122223833, label: 'Nodeping - Verified bot' },
  { key: 122256215, label: 'Factset_spyderbot - Verified bot' },
  { key: 122293105, label: 'Bushbaby - Verified bot' },
  { key: 122293205, label: 'New Relic - Verified bot' },
  { key: 122296797, label: 'Shortwave Image Fetcher - Verified bot' },
  { key: 122331384, label: 'Mollie Bot - Verified bot' },
  { key: 122333288, label: 'Server Density - Verified bot' },
  { key: 122349057, label: 'rss2tg_bot - Verified bot' },
  { key: 122426128, label: 'Yahoo Japan SEO Crawler - Verified bot' },
  { key: 122455622, label: 'Forcepoint - Verified bot' },
  { key: 122483248, label: 'Spectate - Verified bot' },
  { key: 122489482, label: 'Trustly - Verified bot' },
  { key: 122619965, label: 'WorldPay - Verified bot' },
  { key: 122674714, label: 'PaesslerCloudBot - Verified bot' },
  { key: 122675136, label: 'Detectify - Verified bot' },
  { key: 122676052, label: 'MailRUBot - Verified bot' },
  { key: 122783515, label: 'Rackspace - Verified bot' },
  { key: 122804832, label: 'PressEngine Bot - Verified bot' },
  { key: 122811173, label: 'Qualys SSL Scanner - Verified bot' },
  { key: 122886485, label: 'ZoomInfo - Verified bot' },
  { key: 122907302, label: 'Notabot - Verified bot' },
  { key: 122934878, label: 'LinksIndexerBot - Verified bot' },
  { key: 123000706, label: 'Better Uptime - Verified bot' },
  { key: 123127211, label: 'Freespoke - Verified bot' },
  { key: 123151907, label: 'WatchMouse - Verified bot' },
  { key: 123186684, label: 'Alertsite by Smartbear - Verified bot' },
  { key: 123196403, label: 'Akamai Threat Protector - Verified bot' },
  { key: 123243225, label: 'SMTnet PM Bot - Verified bot' },
  { key: 123270683, label: 'KargoBot-Artemis - Verified bot' },
  { key: 123277490, label: 'Algolia - Verified bot' },
  { key: 123280677, label: 'Zendesk Webhook - Verified bot' },
  { key: 123309633, label: 'Yahoo! JAPAN - Verified bot' },
  { key: 123386127, label: 'Dataprovider.com - Verified bot' },
  { key: 123394264, label: 'FDL Stats Bots - Verified bot' },
  { key: 123439742, label: 'TurnitinBot - Verified bot' },
  { key: 123585877, label: 'Stape Scanner - Verified bot' },
  { key: 123603536, label: 'Semrush Link Building Tool - Verified bot' },
  { key: 123619739, label: 'BinaryCanary - Verified bot' },
  { key: 123660167, label: 'Seznam - Verified bot' },
  { key: 123737729, label: 'SecurityHeaders - Verified bot' },
  { key: 123815556, label: 'GPTBot - Verified bot' },
  { key: 123853228, label: 'HoneybadgerBot - Verified bot' },
  { key: 123862922, label: 'Nooshub - Verified bot' },
  { key: 123865897, label: 'Google Videos - Verified bot' },
  { key: 123869909, label: 'Bibliotheque Nacional de France Crawler - Verified bot' },
  { key: 123881983, label: 'SkyHigh Security SWG - Verified bot' },
  { key: 123892163, label: 'UpDownBot - Verified bot' },
  { key: 123893906, label: 'MonitoRSS - Verified bot' },
  { key: 123909607, label: 'catchpoint - Verified bot' },
  { key: 123945485, label: 'Menlo Security Gateway - Verified bot' },
  { key: 124033017, label: "Let's Encrypt - Verified bot" },
  { key: 124033152, label: 'VaultPress - Verified bot' },
  { key: 124082211, label: 'SearchAtlas Bot - Verified bot' },
  { key: 124092144, label: 'HubSpot Page Fetcher - Verified bot' },
  { key: 124121487, label: 'Bazqux - Verified bot' },
  { key: 124132802, label: 'RSS API - Verified bot' },
  { key: 124139111, label: 'ContentKing - Verified bot' },
  { key: 124150991, label: 'PetalBot - Verified bot' },
  { key: 124179547, label: 'WP Umbrella Bot - Verified bot' },
  { key: 124206785, label: 'WARDBot - Verified bot' },
  { key: 124238076, label: 'SmarshBot - Verified bot' },
  { key: 124265885, label: 'Google Favicon - Verified bot' },
  { key: 124312264, label: 'Blogtrottr - Verified bot' },
  { key: 124352628, label: 'Synthetic Bot - Verified bot' },
  { key: 124421193, label: 'Sora Caisse POS - Verified bot' },
  { key: 124435375, label: 'CloudValid Bot - Verified bot' },
  { key: 124439523, label: 'Yahoo Mail - Verified bot' },
  { key: 124451372, label: 'StatusCake - Verified bot' },
  { key: 124496772, label: 'ChargeBee - Verified bot' },
  { key: 124503518, label: 'cookie maestro - Verified bot' },
  { key: 124569440, label: 'Alexa Site Audit - Verified bot' },
  { key: 124581738, label: 'Meta-ExternalAgent - Verified bot' },
  { key: 124614502, label: 'WP Umbrella - Verified bot' },
  { key: 124689706, label: 'XY Archive Compliance Bot - Verified bot' },
  { key: 124769389, label: 'SparkpostBot - Verified bot' },
  { key: 124795928, label: 'Bluesky Link Preview Service - Verified bot' },
  { key: 124851431, label: 'Salesforce - Verified bot' },
  { key: 124895971, label: 'webpagetest - Verified bot' },
  { key: 124923457, label: 'Cá»‘c Cá»‘c - Verified bot' },
  { key: 124924936, label: 'AddThis - Verified bot' },
  { key: 125004316, label: 'Epivoz Crawler - Verified bot' },
  { key: 125019905, label: 'Foregenix ThreatView/WebScan - Verified bot' },
  { key: 125031301, label: 'Bitbucket - Verified bot' },
  { key: 125098700, label: 'Hatena - Verified bot' },
  { key: 125106627, label: 'SiteAuditBot - Verified bot' },
  { key: 125111252, label: 'Thousand Eyes Cloud Agent - Verified bot' },
  { key: 125126137, label: 'FedReporter Bot for FFIEC - Verified bot' },
  { key: 125128007, label: 'SeobilityBot - Verified bot' },
  { key: 125136138, label: 'FeedWind Crawler - Verified bot' },
  { key: 125137661, label: 'Capital One Bot - Verified bot' },
  { key: 125141994, label: 'GTmetrix - Verified bot' },
  { key: 125162514, label: 'Parse.ly - Verified bot' },
  { key: 125187168, label: 'Protopage - Verified bot' },
  { key: 125215085, label: '360Monitoring - Verified bot' },
  { key: 125254570, label: 'LINER Bot - Verified bot' },
  { key: 125270702, label: 'Ozon Web Grabber - Verified bot' },
  { key: 125308987, label: 'Netskope - Verified bot' },
  { key: 125335272, label: 'Monitis - Verified bot' },
  { key: 125350483, label: 'LegalMonster - Verified bot' },
  { key: 125396237, label: 'SequelWP - Verified bot' },
  { key: 125404561, label: 'cognitiveSEO Crawler - Verified bot' },
  { key: 125431946, label: 'Akismet - Verified bot' },
  { key: 125433636, label: 'Lookout SASE - Verified bot' },
  { key: 125436155, label: 'Netcraft - Verified bot' },
  { key: 125500883, label: 'Telegram Bot - Verified bot' },
  { key: 125517114, label: 'StatsDroneBot - Verified bot' },
  { key: 125572179, label: 'ServerHunterSpider - Verified bot' },
  { key: 125618639, label: 'SpiderPig - Verified bot' },
  { key: 125639971, label: 'Netvigie - Verified bot' },
  { key: 125674304, label: 'MediaMonitoringBot - Verified bot' },
  { key: 125719418, label: 'Readable - Verified bot' },
  { key: 125742518, label: 'Kinsta - Verified bot' },
  { key: 125773614, label: 'UptrendsBot - Verified bot' },
  { key: 125788198, label: 'ProjectShield Url Check - Verified bot' },
  { key: 125816561, label: 'Exodus - Verified bot' },
  { key: 125844788, label: 'Exabot - Verified bot' },
  { key: 125845271, label: 'WebSpiderMount - Verified bot' },
  { key: 125863891, label: 'Attracta - Verified bot' },
  { key: 125960595, label: 'Recurly Webhooks - Verified bot' },
  { key: 125968726, label: 'Noibu JS Beautifier - Verified bot' },
  { key: 125996126, label: 'Qualys - Verified bot' },
  { key: 126058259, label: 'HSTS preload bot - Verified bot' },
  { key: 126063440, label: 'Revvim - Verified bot' },
  { key: 126083920, label: 'Yahoo Slurp - Verified bot' },
  { key: 126095099, label: 'Barkrowler - Verified bot' },
  { key: 126116054, label: 'Cloudflare Diagnostics - Verified bot' },
  { key: 126138716, label: 'MelonMesa Bot - Verified bot' },
  { key: 126156804, label: 'PingPing Bot - Verified bot' },
  { key: 126162430, label: 'Hotjar - Verified bot' },
  { key: 126172165, label: 'Channable - Verified bot' },
  { key: 126212165, label: 'OutsellURLValidator - Verified bot' },
  { key: 126255384, label: 'OAI-SearchBot - Verified bot' },
  { key: 126267472, label: 'Fastmail Bot - Verified bot' },
  { key: 126282788, label: 'DataForSEO - Verified bot' },
  { key: 126287954, label: 'ManageWP - Verified bot' },
  { key: 126518054, label: 'Arquivo Web Crawler - Verified bot' },
  { key: 126590737, label: 'NewsNow - Verified bot' },
  { key: 126642733, label: 'Dr. Link Check - Verified bot' },
  { key: 126662428, label: 'WOVN Crawler - Verified bot' },
  { key: 126666910, label: 'DuckAssistbot - Verified bot' },
  { key: 126723210, label: 'UptimeStatistics - Verified bot' },
  { key: 126757287, label: 'Deepcrawl - Verified bot' },
  { key: 126799217, label: 'Marinus Crawler - Verified bot' },
  { key: 126853454, label: 'Noorobot - Verified bot' },
  { key: 126864325, label: 'Crawlson - Verified bot' },
  { key: 126871775, label: 'Perplexityâ€‘User - Verified bot' },
  { key: 126879075, label: 'Determ - Verified bot' },
  { key: 126880202, label: 'SiteUpTimeBot - Verified bot' },
  { key: 126910297, label: 'StatistikAustria - Verified bot' },
  { key: 126953591, label: 'Outbrain - Verified bot' },
  { key: 126987487, label: 'Techloq - Verified bot' },
  { key: 126995338, label: 'Pro Sitemaps - Verified bot' },
  { key: 127003635, label: 'Coinbase Webhooks - Verified bot' },
  { key: 127055198, label: 'Proximic - Verified bot' },
  { key: 127111247, label: 'HubSpot Crawler - Verified bot' },
  { key: 127145171, label: 'BlogVault - Verified bot' },
  { key: 127158783, label: 'Statabot - Verified bot' },
  { key: 127215224, label: 'Google Trust Services (DCV Check) - Verified bot' },
  { key: 127235789, label: 'WordCountBot - Verified bot' },
  { key: 127262324, label: 'Blockaid - Verified bot' },
  { key: 127354986, label: 'Cloudflare Stream Webhook - Verified bot' },
  { key: 127415497, label: 'Alexa - Verified bot' },
  { key: 127465324, label: 'BLEXBot - Verified bot' },
  { key: 127478516, label: 'MonSpark - Verified bot' },
  { key: 127484685, label: 'CaliberBot - Verified bot' },
  { key: 127525740, label: 'MachineLearningForPeaceBot - Verified bot' },
  { key: 127532653, label: 'Snipcart - Verified bot' },
  { key: 127630897, label: 'SiteSearch360 - Verified bot' },
  { key: 127644739, label: 'IAS crawler - Verified bot' },
  { key: 127648025, label: 'PinterestBot - Verified bot' },
  { key: 127661358, label: 'Black Duck Fast Dynamic - Verified bot' },
  { key: 127692545, label: 'Innguma Fetcher - Verified bot' },
  { key: 127695837, label: 'Hype Machine - Verified bot' },
  { key: 127801916, label: 'Quantcastbot - Verified bot' },
  { key: 127853217, label: 'Cloudflare CSUP - Verified bot' },
  { key: 127960750, label: 'Uptime Robot - Verified bot' },
  { key: 127961504, label: 'OpenRSS - Verified bot' },
  { key: 128009269, label: 'SalesViewerBot - Verified bot' },
  { key: 128014955, label: 'Panopta - Verified bot' },
  { key: 128053236, label: 'Checkly Bot - Verified bot' },
  { key: 128094273, label: 'Tumblr - Verified bot' },
  { key: 128144419, label: 'Feedbin - Verified bot' },
  { key: 128248785, label: 'Google Web Snippet - Verified bot' },
  { key: 128297837, label: 'Shopify-Captain-Hook - Verified bot' },
  { key: 128320166, label: 'BugsNag - Verified bot' },
  { key: 128343542, label: 'Bang & Olufsen - Verified bot' },
  { key: 128431734, label: 'MSN - Verified bot' },
  { key: 128432004, label: 'AccessStatus - Verified bot' },
  { key: 128619256, label: 'HostTracker - Verified bot' },
  { key: 128626374, label: 'Artemis Web Reader - Verified bot' },
  { key: 128636172, label: 'Splunk Attack Analyzer - Verified bot' },
  { key: 128643785, label: 'Uptime LLC - Verified bot' },
  { key: 128660910, label: 'Agency Analytics Crawler - Verified bot' },
  { key: 128700020, label: 'Neevabot - Verified bot' },
  { key: 128709283, label: 'Zapier - Verified bot' },
  { key: 128742444, label: 'Medialogia Bot - Verified bot' },
  { key: 128792872, label: 'Huckabuy Bot - Verified bot' },
  { key: 128846250, label: 'MagiBot - Verified bot' },
  { key: 129001800, label: 'SemrushBotSwa - Verified bot' },
  { key: 129039472, label: 'PingPing - Verified bot' },
  { key: 129042485, label: 'Chrome-Lighthouse - Verified bot' },
  { key: 129139413, label: 'Bing Preview - Verified bot' },
  { key: 129174907, label: 'All Africa Crawler - Verified bot' },
  { key: 129193049, label: 'Clickagy - Verified bot' },
  { key: 129222642, label: 'Google AdSense - Verified bot' },
  { key: 129237910, label: 'Easydns - Verified bot' },
  { key: 129242183, label: 'Spark Shipping - Verified bot' },
  { key: 129267794, label: 'YahooCacheSystem - Verified bot' },
  { key: 129280350, label: 'WP Time Capsule - Verified bot' },
  { key: 129294776, label: 'Moz dotbot - Verified bot' },
  { key: 129331960, label: "Grafana's Synthetic Monitoring - Verified bot" },
  { key: 129454250, label: 'Cloudflare SpeedTest - Verified bot' },
  { key: 129454721, label: 'Yext Inc - Verified bot' },
  { key: 129466116, label: 'GuestpostsBot - Verified bot' },
  { key: 129475873, label: 'Cliqzbot - Verified bot' },
  { key: 129495039, label: 'Integromat - Verified bot' },
  { key: 129513517, label: 'Automaton - Verified bot' },
  { key: 129581407, label: 'marketgoo - Verified bot' },
  { key: 129607366, label: 'Worldline Bot - Verified bot' },
  { key: 129611777, label: 'New York Times Newsgathering - Verified bot' },
  { key: 129612877, label: 'seo4ajax - Verified bot' },
  { key: 129641572, label: 'SemrushBotBacklinkAudit - Verified bot' },
  { key: 129654414, label: 'OnlineOrNot Monitor - Verified bot' },
  { key: 129654981, label: 'OCLC HZEP - Verified bot' },
  { key: 129660880, label: 'Cloudflare Prefetch - Verified bot' },
  { key: 129769712, label: 'Broadcom - Verified bot' },
  { key: 129802398, label: 'Cloudflare-Traffic-Manager - Verified bot' },
  { key: 129862394, label: 'BestChange Bot - Verified bot' },
  { key: 129886495, label: 'Entura - Verified bot' },
  { key: 129965421, label: 'elmah.io Uptime Monitoring - Verified bot' },
  { key: 130197178, label: 'ChargeBee - Verified bot' },
  { key: 130198712, label: 'Mavifinds Bot - Verified bot' },
  { key: 130208907, label: 'Feedly - Verified bot' },
  { key: 130229353, label: 'Cookie Hub - Verified bot' },
  { key: 130276870, label: 'twitterbot - Verified bot' },
  { key: 130295907, label: 'MJ12Bot - Verified bot' },
  { key: 130339380, label: 'EvoUptimeBot - Verified bot' },
  { key: 130369677, label: 'SlackbotLinkExpanding - Verified bot' },
  { key: 130414766, label: 'Link Tiger - Verified bot' },
  { key: 130422470, label: 'WordPress - Verified bot' },
  { key: 130489566, label: 'Feeder - Verified bot' },
  { key: 130507404, label: 'MagnetmeBot - Verified bot' },
  { key: 130565225, label: 'Crazy Egg Bot - Verified bot' },
  { key: 130590373, label: 'AdsTxtCrawler - Verified bot' },
  { key: 130676123, label: 'GoPay - Verified bot' },
  { key: 130694769, label: 'LinkCheck - Verified bot' },
  { key: 130749388, label: 'MainWP - Verified bot' },
  { key: 130800099, label: 'W3 Validator Services - Verified bot' },
  { key: 130806650, label: 'HetrixTools - Verified bot' },
  { key: 130858221, label: 'cron-job.org - Verified bot' },
  { key: 130907812, label: 'Taboola - Verified bot' },
  { key: 130928282, label: 'Echobot Bot - Verified bot' },
  { key: 131007707, label: 'SiteLock - Verified bot' },
  { key: 131044722, label: 'Adagio Bot - Verified bot' },
  { key: 131070921, label: 'Accessible Web Bot - Verified bot' },
  { key: 131112457, label: 'DigiCert DCV - Verified bot' },
  { key: 131158780, label: 'Audisto Crawler - Verified bot' },
  { key: 131170744, label: 'Iframely - Verified bot' },
  { key: 131172028, label: 'jobswithgptcom-bot - Verified bot' },
  { key: 131190766, label: 'Internet Archive - Verified bot' },
  { key: 131213663, label: 'Wordpress Namecheap - Verified bot' },
  { key: 131231981, label: 'Area 360 - Verified bot' },
  { key: 131269617, label: 'Skype - Verified bot' },
  { key: 131340380, label: 'GoogleOther - Verified bot' },
  { key: 131342054, label: 'WMF Citoid - Verified bot' },
  { key: 131351453, label: 'Overcast - Verified bot' },
  { key: 131383301, label: 'Library Of Congress Web Archiving - Verified bot' },
  { key: 131394912, label: '2checkout - Verified bot' },
  { key: 131416283, label: 'upday - Verified bot' },
  { key: 131520839, label: 'Slack Image Proxy - Verified bot' },
  { key: 131560112, label: 'iboss - Verified bot' },
  { key: 131587288, label: 'Sentry - Verified bot' },
  { key: 131600359, label: 'Level9SearchBot - Verified bot' },
  { key: 131650187, label: 'Watchbot - Verified bot' },
  { key: 131792310, label: 'Yahoo Japan - Verified bot' },
  { key: 131847989, label: 'Metorik - Verified bot' },
  { key: 131858776, label: 'WordPress.com - Verified bot' },
  { key: 131889006, label: 'LeikiBot - Verified bot' },
  { key: 131938841, label: 'CriteoBot - Verified bot' },
  { key: 131970934, label: 'ZumBot - Verified bot' },
  { key: 131993364, label: 'YahooMailProxy - Verified bot' },
  { key: 131996873, label: 'Sansec Security Monitor - Verified bot' },
  { key: 132012747, label: 'eMoney Advisor - Verified bot' },
  { key: 132044941, label: 'Cloudflare Healthchecks - Verified bot' },
  { key: 132048985, label: 'WormlyBot - Verified bot' },
  { key: 132063225, label: 'MontasticMonitor - Verified bot' },
  { key: 132124516, label: 'Yahoo Ad Monitoring - Verified bot' },
  { key: 132164824, label: 'Baidu - Verified bot' },
  { key: 132200936, label: 'QualifiedBot - Verified bot' },
  { key: 132270384, label: 'Moz rogerbot - Verified bot' },
  { key: 132282713, label: 'IFTTT RSS Feed Service - Verified bot' },
  { key: 132301583, label: 'eRepublik.tools - Verified bot' },
  { key: 132355084, label: 'MRGbot - Verified bot' },
  { key: 132364910, label: 'SemrushBotSI - Verified bot' },
  { key: 132445392, label: 'WebsitePulseBot - Verified bot' },
  { key: 132486269, label: 'AfterShip Magento 2 Connector - Verified bot' },
  { key: 132552623, label: 'DuckDuckBot - Verified bot' },
  { key: 132580853, label: 'DataForSEO Bot - Verified bot' },
  { key: 132602293, label: 'Seekport - Verified bot' },
  { key: 132668446, label: 'Scour RSS Bot - Verified bot' },
  { key: 132733866, label: 'Splunk Synthetics - Verified bot' },
  { key: 132764802, label: 'Siteimprove Crawl - Verified bot' },
  { key: 132784499, label: 'IsDownBot - Verified bot' },
  { key: 132792628, label: 'Amazon Kendra - Verified bot' },
  { key: 132794715, label: 'Mars Finder - Verified bot' },
  { key: 132803734, label: 'NitroBot - Verified bot' },
  { key: 132896626, label: 'Clerk Webhook - Verified bot' },
  { key: 132918581, label: 'MotoMinerBot - Verified bot' },
  { key: 132938853, label: 'SemrushBotBacklinks - Verified bot' },
  { key: 132941654, label: 'SolarWinds Observability - Verified bot' },
  { key: 132960752, label: 'Zscaler - Verified bot' },
  { key: 132995013, label: 'ChatGPT-User - Verified bot' },
  { key: 132999486, label: 'Trellis-Services - Verified bot' },
  { key: 133013330, label: 'Critical CSS Bot - Verified bot' },
  { key: 133035600, label: 'Amazon Contxbot - Verified bot' },
  { key: 133050960, label: 'Botify - Verified bot' },
  { key: 133111982, label: 'Cludo - Verified bot' },
  { key: 133142241, label: 'BoardGamePrices Bot - Verified bot' },
  { key: 133200485, label: 'MgidBot - Verified bot' },
  { key: 133301927, label: 'Ghost Inspector - Verified bot' },
  { key: 133352613, label: 'FlipboardRSS - Verified bot' },
  { key: 133356397, label: 'Trendiction Bot - Verified bot' },
  { key: 133378755, label: 'FlipboardProxy - Verified bot' },
  { key: 133475166, label: 'Netumo - Verified bot' },
  { key: 133492770, label: 'Automate.io Bot - Verified bot' },
  { key: 133506661, label: 'Proofpoint - Verified bot' },
  { key: 133562956, label: 'Google Image Proxy - Verified bot' },
  { key: 133608144, label: 'Adyen - Verified bot' },
  { key: 133621792, label: 'CCBot - Verified bot' },
  { key: 133651824, label: 'InternetArchiveBot - Verified bot' },
  { key: 133654704, label: 'Pingdom - Verified bot' },
  { key: 133661282, label: 'Cxense - Verified bot' },
  { key: 133671294, label: 'Slackbot - Verified bot' },
  { key: 133672756, label: 'Google Feed Fetcher - Verified bot' },
  { key: 133722337, label: 'Missinglettr Bot - Verified bot' },
  { key: 133730073, label: 'Google-CloudVertexBot - Verified bot' },
  { key: 133808157, label: 'TTD Content - Verified bot' },
  { key: 133827886, label: 'discordBot - Verified bot' },
  { key: 133841045, label: 'Groovinads - Verified bot' },
  { key: 133864585, label: 'Cloudflare SSLDetector - Verified bot' },
  { key: 133933265, label: 'AhrefsBot - Verified bot' },
  { key: 134002463, label: 'Google Read Aloud - Verified bot' },
  { key: 134090376, label: 'klaviyo - Verified bot' },
  { key: 134091823, label: 'OnCrawl - Verified bot' },
  { key: 134096637, label: 'Google-Adwords-Instant - Verified bot' },
  { key: 134112289, label: 'Cloudflare Validator - Verified bot' },
  { key: 134122456, label: 'Google StoreBot - Verified bot' },
  { key: 134131089, label: 'Authory - Verified bot' },
  { key: 134177909, label: 'Uptimia - Verified bot' },
  { key: 134192977, label: 'Project Honeypot - Verified bot' },
  { key: 151051910, label: 'Unclassified bot - TLS Signature' },
  { key: 151571662, label: 'Abnormal request - Incorrect Browser Headers' },
  { key: 151790139, label: 'Golang - TLS Signature' },
  { key: 151935671, label: 'Scraping bot - TLS Signature' },
  { key: 152295520, label: 'node - TLS Signature' },
  { key: 152888627, label: 'Python - TLS Signature' },
  { key: 153208682, label: 'Java - TLS Signature' },
  { key: 153620563, label: 'Scraping bot - TLS Signature' },
  { key: 153813573, label: 'Scraping bot - TLS Signature' },
  { key: 154330752, label: 'Vulnerability scanner - TLS Signature' },
  { key: 154357709, label: 'DoS Tool - TLS Signature' },
  { key: 154449703, label: 'Scraping bot - User-agent' },
  { key: 154920374, label: 'Unclassified bot - TLS Signature' },
  { key: 155403339, label: 'AI Bot - User-agent' },
  { key: 155580801, label: 'Golang - TLS Signature' },
  { key: 156711944, label: 'Python - TLS Signature' },
  { key: 157468811, label: 'DoS Tool - TLS Signature' },
  { key: 157718770, label: 'Scraping bot - TLS Signature' },
  { key: 158072645, label: 'DoS Tool - TLS Signature' },
  { key: 158082839, label: 'Scraping bot - TLS Signature' },
  { key: 159364814, label: 'Scraping bot - TLS Signature' },
  { key: 159600225, label: 'Python - TLS Signature' },
  { key: 160352931, label: 'Ruby - TLS Signature' },
  { key: 160454973, label: 'Golang - TLS Signature' },
  { key: 160901235, label: 'Unclassified bot - TLS Signature' },
  { key: 160956963, label: 'Ruby - TLS Signature' },
  { key: 161794528, label: 'Scraping bot - TLS Signature' },
  { key: 162007718, label: 'Java - TLS Signature' },
  { key: 162073760, label: 'cURL - TLS Signature' },
  { key: 162118083, label: 'Python - TLS Signature' },
  { key: 162444022, label: 'Python - TLS Signature' },
  { key: 162587232, label: 'Workers Browser - Cloudflare Service' },
  { key: 162739949, label: 'Scraping bot - TLS Signature' },
  { key: 162742967, label: 'Golang - TLS Signature' },
  { key: 162961728, label: 'ATO Bot - TLS Signature' },
  { key: 163028021, label: 'Scraping bot - TLS Signature' },
  { key: 163305579, label: 'Java - TLS Signature' },
  { key: 163338236, label: 'Golang - TLS Signature' },
  { key: 163372860, label: 'Unclassified bot - TLS Signature' },
  { key: 164080006, label: 'Scraping bot - TLS Signature' },
  { key: 164127939, label: 'php - TLS Signature' },
  { key: 164436501, label: 'Golang - TLS Signature' },
  { key: 164610470, label: 'cURL - TLS Signature' },
  { key: 164625698, label: 'Scraping bot - TLS Signature' },
  { key: 165102111, label: 'Python - TLS Signature' },
  { key: 165348117, label: 'Golang - TLS Signature' },
  { key: 166185009, label: 'DoS Tool - TLS Signature' },
  { key: 167139453, label: 'Golang - TLS Signature' },
  { key: 201326592, label: 'Login Failure Anomaly' },
  { key: 201326593, label: 'Login Attempt Anomaly' },
  { key: 201326598, label: 'Login Failure Anomaly' },
  { key: 201326599, label: 'Login Attempt Anomaly' },
]

// 洲/大陆
export const CONTINENTS = [
  {
    key: 'AF',
    label: 'Africa',
  },
  {
    key: 'AN',
    label: 'Antarctica',
  },
  {
    key: 'AS',
    label: 'Asia',
  },
  {
    key: 'EU',
    label: 'Europe',
  },
  {
    key: 'NA',
    label: 'North America',
  },
  {
    key: 'OC',
    label: 'Oceania',
  },
  {
    key: 'SA',
    label: 'South America',
  },
  {
    key: 'T1',
    label: 'Tor',
  },
]

// 请求方法
export const REQUEST_METHODS = [
  {
    key: 'GET',
    label: 'GET',
  },
  {
    key: 'POST',
    label: 'POST',
  },
  {
    key: 'PURGE',
    label: 'PURGE',
  },
  {
    key: 'PUT',
    label: 'PUT',
  },
  {
    key: 'HEAD',
    label: 'HEAD',
  },
  {
    key: 'OPTIONS',
    label: 'OPTIONS',
  },
  {
    key: 'DELETE',
    label: 'DELETE',
  },
  {
    key: 'PATCH',
    label: 'PATCH',
  },
]

export const HTTP_VERSIONS = [
  {
    key: 'HTTP/1.0',
    label: 'HTTP/1.0',
  },
  {
    key: 'HTTP/1.1',
    label: 'HTTP/1.1',
  },
  {
    key: 'HTTP/1.2',
    label: 'HTTP/1.2',
  },
  {
    key: 'HTTP/2',
    label: 'HTTP/2',
  },
  {
    key: 'HTTP/3',
    label: 'HTTP/3',
  },
  {
    key: 'SPDY/3.1',
    label: 'SPDY/3.1',
  },
]

const BOT_CATEGORIES = [
  {
    key: 'Search Engine Crawler',
    label: i18n.t('network.waf.category.search_engine_crawler'),
  },
  {
    key: 'Search Engine Optimization',
    label: i18n.t('network.waf.category.search_engine_optimization'),
  },
  {
    key: 'Monitoring & Analytics',
    label: i18n.t('network.waf.category.monitoring_analytics'),
  },
  {
    key: 'Advertising & Marketing',
    label: i18n.t('network.waf.category.advertising_marketing'),
  },
  {
    key: 'Page Preview',
    label: i18n.t('network.waf.category.page_preview'),
  },
  {
    key: 'Security',
    label: i18n.t('network.waf.category.security'),
  },
  {
    key: 'Accessibility',
    label: i18n.t('network.waf.category.accessibility'),
  },
  {
    key: 'Webhooks',
    label: i18n.t('network.waf.category.webhooks'),
  },
  {
    key: 'Feed Fetcher',
    label: i18n.t('network.waf.category.feed_fetcher'),
  },
  {
    key: 'AI Crawler',
    label: i18n.t('network.waf.category.ai_crawler'),
  },
  {
    key: 'Aggregator',
    label: i18n.t('network.waf.category.aggregator'),
  },
  {
    key: 'AI Assistant',
    label: i18n.t('network.waf.category.ai_assistant'),
  },
  {
    key: 'AI Search',
    label: i18n.t('network.waf.category.ai_search'),
  },
  {
    key: 'Archiver',
    label: i18n.t('network.waf.category.archiver'),
  },
  {
    key: 'Other',
    label: i18n.t('network.waf.category.other'),
  },
]

const IP_VALUE_LIST = [
  {
    key: 'cf.anonymizer',
    label: i18n.t('network.waf.ip_src.cf_anonymizer'),
  },
  {
    key: 'cf.botnetcc',
    label: i18n.t('network.waf.ip_src.cf_botnetcc'),
  },
  {
    key: 'cf.malware',
    label: i18n.t('network.waf.ip_src.cf_malware'),
  },
  {
    key: 'cf.open_proxies',
    label: i18n.t('network.waf.ip_src.cf_open_proxies'),
  },
  {
    key: 'cf.vpn',
    label: i18n.t('network.waf.ip_src.cf_vpn'),
  },
]

const strOpts = ['wildcard', 'strict_wildcard', 'eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'starts_with', 'not_starts_with', 'ends_with', 'not_ends_with']
// 规则列表配置
export const WAF_RULE_TYPES = [
  {
    type: 'http.request.full_uri',
    opts: strOpts,
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard') return 'https://*.example.com/files/*'
      if (opt === 'strict_wildcard') return 'https://*.example.com/Files/*'
      if (['matches', 'not_matches'].includes(opt)) return 'https://test.com/docs/0[7-8]/$'
      return 'https://example.com/contact?page=1234'
    },
  },
  {
    type: 'http.request.uri',
    opts: strOpts,
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard') return '/content/*?page=1234'
      if (opt === 'strict_wildcard') return '/*/content?page=1234'
      if (['matches', 'not_matches'].includes(opt)) return '?count=[0-9]'
      return '/content?page=1234'
    },
  },
  {
    type: 'http.request.uri.path',
    opts: ['wildcard', 'strict_wildcard', 'eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'starts_with', 'not_starts_with', 'ends_with', 'not_ends_with', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard') return '/content/*'
      if (opt === 'strict_wildcard') return '/*/content'
      if (['matches', 'not_matches'].includes(opt)) return '^/articles/200[7-8]/'
      return '/content'
    },
  },
  {
    type: 'http.request.uri.query',
    opts: strOpts,
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard') return 'page=1234*'
      if (opt === 'strict_wildcard') return 'page=*'
      if (['matches', 'not_matches'].includes(opt)) return 'page=[0-9]'
      return 'page=1234'
    },
  },
  {
    type: 'ip.src.asnum',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => '13335',
  },
  {
    type: 'http.cookie',
    opts: strOpts,
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard') return 'name=val*'
      if (['matches', 'not_matches'].includes(opt)) return '_authverify=.*[0-5][4]'
      return 'name = value'
    },
  },
  {
    type: 'ip.src.country',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'single-select'
    },
    valueOpts: COUNTRYS,
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'ip.src.continent',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'single-select'
    },
    valueOpts: CONTINENTS,
    belongs: ['custom', 'rate_limit', 'managed', 'ratelimit_custom'],
  },
  {
    type: 'http.host',
    opts: ['wildcard', 'strict_wildcard', 'eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'starts_with', 'not_starts_with', 'ends_with', 'not_ends_with', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard' || opt === 'strict_wildcard') return 'example.com*'
      if (['matches', 'not_matches'].includes(opt)) return '(www.|blog.)test.com'
      return 'example.com'
    },
  },
  {
    type: 'ip.src',
    opts: ['eq', 'ne', 'in', 'not_in', 'in_list', 'not_in_list'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'eq' || opt === 'ne') {
        return 'input'
      }
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'single-select'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueOpts: (valueType) => {
      if (valueType === 'multi-select') {
        return []
      }
      return IP_VALUE_LIST
    },
    valueExtra: '192.0.0.1',
  },
  {
    type: 'http.referer',
    opts: strOpts,
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard') return '^http://test.com/page/*/(.*)'
      if (opt === 'matches') return '^http://test.com/page/(.*)'
      if (opt === 'not_matches') return '^http://test.com/*/page/(.*)'
      return 'example.com'
    },
  },
  {
    type: 'http.request.method',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'single-select'
    },
    valueOpts: REQUEST_METHODS,
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: 'GET',
  },
  {
    type: 'ssl',
    opts: ['eq'],
    optDisabled: true,
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'http.request.version',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'single-select'
    },
    valueOpts: HTTP_VERSIONS,
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'http.user_agent',
    opts: strOpts,
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard' || opt === 'strict_wildcard') return 'Mozilla/* (Macintosh; Intel Mac OS X 10_15_7) ...'
      if (opt === 'matches' || opt === 'not_matches') return '.*MSIE [8-9].*'
      return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...'
    },
  },
  {
    type: 'http.x_forwarded_for',
    opts: strOpts,
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard' || opt === 'strict_wildcard') return '192.0.*, 192.1.*'
      return '192.0.0.1, 192.1.0.1'
    },
  },
  {
    type: 'cf.tls_client_auth.cert_verified',
    opts: ['eq'],
    optDisabled: true,
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.fraud_detection.disposable_email',
    opts: ['eq'],
    optDisabled: true,
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'managed'],
  },
  {
    type: 'cf.client.bot',
    opts: ['eq'],
    optDisabled: true,
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.bot_management.verified_bot',
    opts: ['eq'],
    optDisabled: true,
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.verified_bot_category',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'single-select'
    },
    valueOpts: BOT_CATEGORIES,
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.bot_management.score',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: '1-99',
    props: (type, opt) => {
      if (!['in', 'not_in'].includes(opt)) {
        return {
          min: 1,
          max: 99,
          step: 1,
          precision: 0,
        }
      }
      return {}
    },
  },
  {
    type: 'cf.bot_management.static_resource',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.bot_management.js_detection.passed',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.bot_management.ja3_hash',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: 'df669e7ea913f1ac0c0cce9ac201a2ec1',
  },
  {
    type: 'cf.bot_management.ja4',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: 't13d1516h2_8daaf6152771_b186095e22b6 ',
  },
  {
    type: 'cf.bot_management.corporate_proxy',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'managed'],
  },
  {
    type: 'cf.bot_management.detection_ids',
    opts: ['eq', 'ne', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'single-select'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueOpts: IDS.map(item => ({ key: item.key, label: `${item.key} (${item.label})` })),
  },
  {
    type: 'ip.src.is_in_european_union',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom'],
  },
  {
    type: 'cf.waf.score.sqli',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom'],
    valueExtra: '5',
    props: (type, opt) => {
      if (!['in', 'not_in'].includes(opt)) {
        return {
          min: 1,
        }
      }
      return {}
    },
  },
  {
    type: 'cf.waf.score.xss',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom'],
    valueExtra: '5',
    props: (type, opt) => {
      if (!['in', 'not_in'].includes(opt)) {
        return {
          min: 1,
        }
      }
      return {}
    },
  },
  {
    type: 'cf.waf.score.rce',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom'],
    valueExtra: '5',
    props: (type, opt) => {
      if (!['in', 'not_in'].includes(opt)) {
        return {
          min: 1,
        }
      }
      return {}
    },
  },
  {
    type: 'cf.waf.score',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom'],
    valueExtra: '5',
    props: (type, opt) => {
      if (!['in', 'not_in'].includes(opt)) {
        return {
          min: 1,
        }
      }
      return {}
    },
  },
  {
    type: 'http.request.body.raw',
    opts: ['eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'starts_with', 'not_starts_with', 'ends_with', 'not_ends_with'],
    isShowName: false,
    valueType: 'input',
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'http.request.body.size',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: '10000(in bytes)',
  },
  {
    type: 'lookup_json_string',
    opts: ['eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'starts_with', 'not_starts_with', 'ends_with', 'not_ends_with', 'in', 'not_in'],
    isShowName: true,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.waf.auth_cetected',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit'],
  },
  {
    type: 'cf.waf.credential_check.username_leaked',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit'],
  },
  {
    type: 'cf.waf.credential_check.username_password_similar',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit'],
  },
  {
    type: 'cf.waf.credential_check.username_and_password_leaked',
    opts: ['eq'],
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit'],
  },
  {
    type: 'http.request.body.mime',
    opts: [...strOpts, 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    valueExtra: (type, opt) => {
      if (opt === 'wildcard') return 'image/*'
      return 'image/png'
    },
  },
  {
    type: 'http.request.headers',
    opts: ['eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'in', 'not_in', 'len', 'not_len'],
    isShowName: (type, opt) => {
      if (opt === 'len' || opt === 'not_len') {
        return false
      }
      return true
    },
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
    nameExtra: 'content-type',
  },
  {
    type: 'http.request.cookies',
    opts: ['eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'in', 'not_in', 'len', 'not_len'],
    isShowName: (type, opt) => {
      if (opt === 'len' || opt === 'not_len') {
        return false
      }
      return true
    },
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['custom', 'rate_limit', 'ratelimit_custom', 'managed'],
  },
  {
    type: 'cf.waf.credential_check.password_leaked',
    opts: ['eq'],
    optDisabled: true,
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom', 'rate_limit'],
  },
  {
    type: 'cf.api_gateway.fallthrough_detected',
    opts: ['eq'],
    optDisabled: true,
    isShowName: false,
    valueType: 'switch',
    belongs: ['custom'],
  },
  {
    type: 'http.response.headers',
    opts: ['eq', 'ne', 'contains', 'not_contains', 'matches', 'not_matches', 'in', 'not_in', 'len', 'not_len'],
    isShowName: (type, opt) => {
      if (opt === 'len' || opt === 'not_len') {
        return false
      }
      return true
    },
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input'
    },
    belongs: ['ratelimit_custom'],
  },
  {
    type: 'http.response.code',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['ratelimit_custom'],
  },
  {
    type: 'cf.threat_score',
    opts: ['eq', 'ne', 'gt', 'lt', 'ge', 'le', 'in', 'not_in'],
    isShowName: false,
    valueType: (opt) => {
      if (opt === 'in' || opt === 'not_in') {
        return 'multi-select'
      }
      return 'input-number'
    },
    belongs: ['ratelimit_custom', 'managed'],
  },
]

// 速率限制规则
export const RATE_LIMIT_RULE_TYPES = [
  {
    type: 'http.request.headers',
    valueType: 'input',
    valueFormat: (type, value) => {
      return `${type}["${value}"]`
    },
    decodeDescription: (str) => {
      const reg = /^http\.request\.headers\["([^"]+)"\]$/
      const match = str.match(reg)
      if (match) {
        return {
          type: 'http.request.headers',
          value: match[1],
        }
      }
      return null
    },
  },
  {
    type: 'ip.src',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'ip.src') {
        return {
          type: 'ip.src',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'cf.unique_visitor_id',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'cf.unique_visitor_id') {
        return {
          type: 'cf.unique_visitor_id',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'http.request.cookies',
    valueType: 'input',
    valueFormat: (type, value) => {
      return `${type}["${value}"]`
    },
    decodeDescription: (str) => {
      const reg = /^http\.request\.cookies\["([^"]+)"\]$/
      const match = str.match(reg)
      if (match) {
        return {
          type: 'http.request.cookies',
          value: match[1],
        }
      }
      return null
    },
  },
  {
    type: 'http.request.uri.args',
    valueType: 'input',
    valueFormat: (type, value) => {
      return `${type}["${value}"]`
    },
    decodeDescription: (str) => {
      const reg = /^http\.request\.uri\.args\["([^"]+)"\]$/
      const match = str.match(reg)
      if (match) {
        return {
          type: 'http.request.uri.args',
          value: match[1],
        }
      }
      return null
    },
  },
  {
    type: 'http.host',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'http.host') {
        return {
          type: 'http.host',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'http.request.uri.path',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'http.request.uri.path') {
        return {
          type: 'http.request.uri.path',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'ip.src.asnum',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'ip.src.asnum') {
        return {
          type: 'ip.src.asnum',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'ip.src.country',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'ip.src.country') {
        return {
          type: 'ip.src.country',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'cf.bot_management.ja3_hash',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'cf.bot_management.ja3_hash') {
        return {
          type: 'cf.bot_management.ja3_hash',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'cf.bot_management.ja4',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'cf.bot_management.ja4') {
        return {
          type: 'cf.bot_management.ja4',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'lookup_json_string',
    valueType: 'input',
    valueFormat: (type, value) => {
      return `${type}(http.request.body.raw, "${value}")`
    },
    decodeDescription: (str) => {
      const reg = /lookup_json_string\(http\.request\.body\.raw,\s*"([^"]+)"\)/
      const match = str.match(reg)
      if (match) {
        return {
          type: 'lookup_json_string',
          value: match[1],
        }
      }
      return null
    },
  },
  {
    type: 'lookup_json_integer',
    valueType: 'input',
    valueFormat: (type, value) => {
      return `${type}(http.request.body.raw, "${value}")`
    },
    decodeDescription: (str) => {
      const reg = /lookup_json_integer\(http\.request\.body\.raw,\s*"([^"]+)"\)/
      const match = str.match(reg)
      if (match) {
        return {
          type: 'lookup_json_integer',
          value: match[1],
        }
      }
      return null
    },
  },
  {
    type: 'http.request.body.form',
    valueType: 'input',
    valueFormat: (type, value) => {
      return `${type}["${value}"]`
    },
    decodeDescription: (str) => {
      const reg = /^http\.request\.body\.form\["([^"]+)"\]$/
      const match = str.match(reg)
      if (match) {
        return {
          type: 'http.request.body.form',
          value: match[1],
        }
      }
      return null
    },
  },
  {
    type: 'http.request.body.raw',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'http.request.body.raw') {
        return {
          type: 'http.request.body.raw',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'http.request.body.size',
    valueType: null,
    valueFormat: (type, value) => {
      return `${type}`
    },
    decodeDescription: (str) => {
      if (str === 'http.request.body.size') {
        return {
          type: 'http.request.body.size',
          value: undefined,
        }
      }
      return null
    },
  },
  {
    type: 'custom',
    valueType: 'input',
    valueFormat: (type, value) => {
      return `${value}`
    },
    decodeDescription: (str) => {
      return {
        type: 'custom',
        value: str,
      }
    },
  },
]
export const WAF_RULE_TYPES_MAP = arrayToObj(WAF_RULE_TYPES, 'type')

export const RATE_LIMIT_RULE_TYPES_MAP = arrayToObj(RATE_LIMIT_RULE_TYPES, 'type')

export const isShowName = (typeKey, opt) => {
  return (typeKey === 'http.request.cookies' || typeKey === 'http.request.headers') && opt !== 'len' && opt !== 'not_len'
}

export const isSwitch = (typeKey, opt) => {
  return WAF_RULE_TYPES.filter(item => item.valueType === 'switch').some(item => item.type === typeKey)
}

// 去除引号
function removeQuotes (str) {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1)
  }
  return str
}

function getMatchReg (type, str) {
  const types = WAF_RULE_TYPES.map(item => item.type).map(type => type.replace(/\./g, '\\.'))
  const regs = {
    wildcard: `^(${types.join('|')}) wildcard r?"([^"]*)"$`,
    strict_wildcard: `^(${types.join('|')}) strict wildcard r?"([^"]*)"$`,
    switch_eq: `^(${types.join('|')})$`,
    switch_ne: `^not (${types.join('|')})$`,
    name_eq: `^any\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] eq "([^"]*)"\\)`,
    eq_number: `^(${types.join('|')}) eq\\s*(\\d*)$`,
    eq_string: `^(${types.join('|')}) eq "([^"]*)"$`,
    eq_ip: `^(${types.join('|')}) eq ((?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)){3})$`,
    eq_select_number: `^any\\((${types.join('|')})\\[\\*\\] eq\\s*(\\d*)\\)`,
    name_ne: `^all\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] ne "([^"]*)"\\)`,
    ne_number: `^(${types.join('|')}) ne\\s*(\\d*)$`,
    ne_string: `^(${types.join('|')}) ne "([^"]*)"$`,
    ne_ip: `^(${types.join('|')}) ne ((?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)){3})$`,
    ne_select_number: `all\\((${types.join('|')})\\[\\*\\] ne\\s*(\\d*)\\)`,
    name_contains: `any\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] contains "([^"]*)"\\)`,
    contains_string: `^(${types.join('|')}) contains "([^"]*)"$`,
    name_not_contains: `not any\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] contains "([^"]*)"\\)`,
    not_contains_string: `^not (${types.join('|')}) contains "([^"]*)"$`,
    name_matches: `^any\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] matches "([^"]*)"\\)`,
    matches_string: `^(${types.join('|')}) matches r?"([^"]*)"$`,
    name_not_matches: `^not any\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] matches "([^"]*)"\\)`,
    not_matches_string: `^not (${types.join('|')}) matches r?"([^"]*)"$`,
    starts_with: `^starts_with\\((${types.join('|')}),\\s*"([^"]*)"\\)$`,
    not_starts_with: `^not starts_with\\((${types.join('|')}),\\s*"([^"]*)"\\)$`,
    ends_with: `^ends_with\\((${types.join('|')}),\\s*"([^"]*)"\\)$`,
    not_ends_with: `^not ends_with\\((${types.join('|')}),\\s*"([^"]*)"\\)$`,
    name_in: `^any\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] in \\{((?:\\s*"[^"]+"\\s*)+)\\}\\)`,
    in_number: `^(${types.join('|')}) in \\{([^}]+)\\}$`,
    in_string: `^(${types.join('|')}) in \\{((?:\\s*"[^"]+"\\s*)+)\\}$`,
    in_ips: `^(${types.join('|')}) in \\{([^"]*)\\}$`,
    in_select_number: `^any\\((${types.join('|')})\\[\\*\\] in \\{((?:\\s*\\d+\\s*)+)\\}\\)`,
    not_name_in: `^not any\\((${types.join('|')})\\["([^"]*)"\\]\\[\\*\\] in \\{((?:\\s*"[^"]+"\\s*)+)\\}\\)`,
    not_in_number: `^not (${types.join('|')}) in \\{([^}]+)\\}$`,
    not_in_string: `^not (${types.join('|')}) in \\{((?:\\s*"[^"]+"\\s*)+)\\}$`,
    not_in_ips: `^not (${types.join('|')}) in \\{([^"]*)\\}$`,
    not_in_select_number: `^not any\\((${types.join('|')})\\[\\*\\] in \\{((?:\\s*\\d+\\s*)+)\\}\\)`,
    gt: `^(${types.join('|')}) gt\\s*(\\d*)$`,
    lt: `^(${types.join('|')}) lt\\s*(\\d*)$`,
    ge: `^(${types.join('|')}) ge\\s*(\\d*)$`,
    le: `^(${types.join('|')}) le\\s*(\\d*)$`,
    len: `^len\\((${types.join('|')})\\["([^"]*)"\\]\\) > 0$`,
    not_len: `^not len\\((${types.join('|')})\\["([^"]*)"\\]\\) > 0$`,
    in_list: `^(${types.join('|')}) in \\$(${IP_VALUE_LIST.map(item => item.key).join('|')})$`,
    not_in_list: `^not (${types.join('|')}) in \\$(${IP_VALUE_LIST.map(item => item.key).join('|')})$`,
    eq_json_string: '^lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) eq "([^"]+)"$',
    ne_json_string: '^lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) ne "([^"]+)"$',
    contains_json_string: '^lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) contains "([^"]+)"$',
    not_contains_json_string: '^not lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) contains "([^"]+)"$',
    matches_json_string: '^lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) matches "([^"]+)"$',
    not_matches_json_string: '^not lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) matches "([^"]+)"$',
    starts_with_json_string: '^lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) starts_with "([^"]+)"$',
    not_starts_with_json_string: '^not lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) starts_with "([^"]+)"$',
    ends_with_json_string: '^lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) ends_with "([^"]+)"$',
    not_ends_with_json_string: '^not lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) ends_with "([^"]+)"$',
    in_json_string: '^lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) in \\{((?:\\s*"[^"]+"\\s*)+)\\}$',
    not_in_json_string: '^not lookup_json_string\\(http\\.request\\.body\\.raw,\\s*"([^"]+)"\\) in \\{((?:\\s*"[^"]+"\\s*)+)\\}$',
  }
  const reg = new RegExp(regs[type])
  const match = str.match(reg)
  if (match) {
    return {
      match: true,
      list: match.slice(1),
    }
  }
  return { match: false }
}

// 运算符类型
export const WAF_RULE_OPTS_MAP = {
  wildcard: {
    valueFormat: (typeKey, name, value) => `${typeKey} wildcard "${value}"`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('wildcard', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'wildcard',
          value: removeQuotes(list[1]),
        }
      }
      return null
    },
  },
  strict_wildcard:
  {
    key: 'strict wildcard',
    valueFormat: (typeKey, name, value) => `${typeKey} strict wildcard "${value}"`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('strict_wildcard', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'strict wildcard',
          value: removeQuotes(list[1]),
        }
      }
      return null
    },
  },
  eq: {
    valueFormat: (typeKey, name, value) => {
      if (isSwitch(typeKey)) {
        return `${value ? '' : 'not '}${typeKey}`
      }
      if (isShowName(typeKey, 'eq')) {
        return `any(${typeKey}["${name || ''}"][*] eq "${value}")`
      }
      if (typeKey === 'cf.bot_management.detection_ids') {
        return `any(${typeKey}[*] eq ${value})`
      }
      if (getRuleConfig({ type: typeKey, opt: 'eq' }).valueType === 'input-number' || typeKey === 'ip.src') {
        return `${typeKey} eq ${value}`
      }
      if (typeKey === 'lookup_json_string') {
        return `lookup_json_string(http.request.body.raw, "${name}") eq "${value}"`
      }
      return `${typeKey} eq "${value}"`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('switch_eq', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'eq',
          value: true,
        }
      }
      const { match: match1, list: list1 } = getMatchReg('switch_ne', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'eq',
          value: false,
        }
      }
      const { match: match2, list: list2 } = getMatchReg('name_eq', str)
      if (match2) {
        return {
          type: list2[0],
          name: list2[1],
          opt: 'eq',
          value: list2[2],
        }
      }
      const { match: match3, list: list3 } = getMatchReg('eq_number', str)
      if (match3) {
        return {
          type: list3[0],
          name: undefined,
          opt: 'eq',
          value: list3[1] ? Number(list3[1]) : undefined,
        }
      }
      const { match: match4, list: list4 } = getMatchReg('eq_string', str)
      if (match4) {
        if (list4[0] === 'cf.verified_bot_category') {
          if (!BOT_CATEGORIES.some(item => item.key === list4[1])) return null
        }
        return {
          type: list4[0],
          name: undefined,
          opt: 'eq',
          value: list4[1],
        }
      }
      const { match: match5, list: list5 } = getMatchReg('eq_ip', str)
      if (match5) {
        return {
          type: list5[0],
          name: undefined,
          opt: 'eq',
          value: list5[1],
        }
      }
      const { match: match6, list: list6 } = getMatchReg('eq_select_number', str)
      if (str.includes('cf.bot_management.detection_ids') && match6) {
        return {
          type: list6[0],
          name: undefined,
          opt: 'eq',
          value: list6[1],
        }
      }
      const { match: match7, list: list7 } = getMatchReg('eq_json_string', str)
      if (match7) {
        return {
          type: 'lookup_json_string',
          name: list7[0],
          opt: 'eq',
          value: list7[1],
        }
      }
      return null
    },
  },
  ne: {
    valueFormat: (typeKey, name, value) => {
      if (isShowName(typeKey, 'ne')) {
        return `all(${typeKey}["${name || ''}"][*] ne "${value}")`
      }
      if (getRuleConfig({ type: typeKey, opt: 'ne' }).valueType === 'input-number' || typeKey === 'ip.src') {
        return `${typeKey} ne ${value}`
      }
      if (typeKey === 'cf.bot_management.detection_ids') {
        return `all(${typeKey}[*] ne ${value})`
      }
      if (typeKey === 'lookup_json_string') {
        return `lookup_json_string(http.request.body.raw, "${name}") ne "${value}"`
      }
      return `${typeKey} ne "${value}"`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('name_ne', str)
      if (match) {
        return {
          type: list[0],
          name: list[1],
          opt: 'ne',
          value: list[2],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('ne_number', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'ne',
          value: list1[1] ? Number(list1[1]) : undefined,
        }
      }
      const { match: match2, list: list2 } = getMatchReg('ne_string', str)
      if (match2) {
        if (list2[0] === 'cf.verified_bot_category') {
          if (!BOT_CATEGORIES.some(item => item.key === list2[1])) return null
        }
        return {
          type: list2[0],
          name: undefined,
          opt: 'ne',
          value: list2[1],
        }
      }
      const { match: match3, list: list3 } = getMatchReg('ne_ip', str)
      if (match3) {
        return {
          type: list3[0],
          name: undefined,
          opt: 'ne',
          value: list3[1],
        }
      }
      const { match: match4, list: list4 } = getMatchReg('ne_select_number', str)
      if (str.includes('cf.bot_management.detection_ids') && match4) {
        return {
          type: list4[0],
          name: undefined,
          opt: 'ne',
          value: list4[1] ? Number(list4[1]) : undefined,
        }
      }
      const { match: match5, list: list5 } = getMatchReg('ne_json_string', str)
      if (match5) {
        return {
          type: 'lookup_json_string',
          name: list5[0],
          opt: 'ne',
          value: list5[1],
        }
      }
      return null
    },
  },
  contains: {
    valueFormat: (typeKey, name, value) => {
      if (isShowName(typeKey, 'contains')) {
        return `any(${typeKey}["${name || ''}"][*] contains "${value}")`
      }
      if (typeKey === 'lookup_json_string') {
        return `lookup_json_string(http.request.body.raw, "${name}") contains "${value}"`
      }
      return `${typeKey} contains "${value}"`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('name_contains', str)
      if (match) {
        return {
          type: list[0],
          name: list[1],
          opt: 'contains',
          value: list[2],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('contains_string', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'contains',
          value: list1[1],
        }
      }
      const { match: match2, list: list2 } = getMatchReg('contains_json_string', str)
      if (match2) {
        return {
          type: 'lookup_json_string',
          name: list2[0],
          opt: 'contains',
          value: list2[1],
        }
      }
      return null
    },
  },
  not_contains: {
    valueFormat: (typeKey, name, value) => {
      if (isShowName(typeKey, 'not_contains')) {
        return `not any(${typeKey}["${name || ''}"][*] contains "${value}")`
      }
      if (typeKey === 'lookup_json_string') {
        return `not lookup_json_string(http.request.body.raw, "${name}") contains "${value}"`
      }
      return `not ${typeKey} contains "${value}"`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('name_not_contains', str)
      if (match) {
        return {
          type: list[0],
          name: list[1],
          opt: 'not_contains',
          value: list[2],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('not_contains_string', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'not_contains',
          value: list1[1],
        }
      }
      const { match: match2, list: list2 } = getMatchReg('not_contains_json_string', str)
      if (match2) {
        return {
          type: 'lookup_json_string',
          name: list2[0],
          opt: 'not_contains',
          value: list2[1],
        }
      }
      return null
    },
  },
  matches: {
    valueFormat: (typeKey, name, value) => {
      if (isShowName(typeKey, 'matches')) {
        return `any(${typeKey}["${name || ''}"][*] matches "${value}")`
      }
      if (typeKey === 'lookup_json_string') {
        return `lookup_json_string(http.request.body.raw, "${name}") matches "${value}"`
      }
      return `${typeKey} matches "${value}"`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('name_matches', str)
      if (match) {
        return {
          type: list[0],
          name: list[1],
          opt: 'matches',
          value: list[2],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('matches_string', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'matches',
          value: list1[1],
        }
      }
      const { match: match2, list: list2 } = getMatchReg('matches_json_string', str)
      if (match2) {
        return {
          type: 'lookup_json_string',
          name: list2[0],
          opt: 'matches',
          value: list2[1],
        }
      }
      return null
    },
  },
  not_matches: {
    valueFormat: (typeKey, name, value) => {
      if (isShowName(typeKey, 'not_matches')) {
        return `not any(${typeKey}["${name || ''}"][*] matches "${value}")`
      }
      if (typeKey === 'lookup_json_string') {
        return `not lookup_json_string(http.request.body.raw, "${name}") matches "${value}"`
      }
      return `not ${typeKey} matches "${value}"`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('name_not_matches', str)
      if (match) {
        return {
          type: list[0],
          name: list[1],
          opt: 'not_matches',
          value: list[2],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('not_matches_string', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'not_matches',
          value: list1[1],
        }
      }
      const { match: match2, list: list2 } = getMatchReg('not_matches_json_string', str)
      if (match2) {
        return {
          type: 'lookup_json_string',
          name: list2[0],
          opt: 'not_matches',
          value: list2[1],
        }
      }
      return null
    },
  },
  starts_with: {
    valueFormat: (typeKey, name, value) => {
      if (typeKey === 'lookup_json_string') {
        return `lookup_json_string(http.request.body.raw, "${name}") starts_with "${value}"`
      }
      return `starts_with(${typeKey}, "${value}")`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('starts_with', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'starts_with',
          value: list[1],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('starts_with_json_string', str)
      if (match1) {
        return {
          type: 'lookup_json_string',
          name: list1[0],
          opt: 'starts_with',
          value: list1[1],
        }
      }
      return null
    },
  },
  not_starts_with: {
    valueFormat: (typeKey, name, value) => {
      if (typeKey === 'lookup_json_string') {
        return `not lookup_json_string(http.request.body.raw, "${name}") starts_with "${value}"`
      }
      return `not starts_with(${typeKey}, "${value}")`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('not_starts_with', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'not_starts_with',
          value: list[1],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('not_starts_with_json_string', str)
      if (match1) {
        return {
          type: 'lookup_json_string',
          name: list1[0],
          opt: 'not_starts_with',
          value: list1[1],
        }
      }
      return null
    },
  },
  ends_with: {
    valueType: 'input',
    valueFormat: (typeKey, name, value) => {
      if (typeKey === 'lookup_json_string') {
        return `lookup_json_string(http.request.body.raw, "${name}") ends_with "${value}"`
      }
      return `ends_with(${typeKey}, "${value}")`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('ends_with', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'ends_with',
          value: list[1],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('ends_with_json_string', str)
      if (match1) {
        return {
          type: 'lookup_json_string',
          name: list1[0],
          opt: 'ends_with',
          value: list1[1],
        }
      }
      return null
    },
  },
  not_ends_with: {
    valueFormat: (typeKey, name, value) => {
      if (typeKey === 'lookup_json_string') {
        return `not lookup_json_string(http.request.body.raw, "${name}") ends_with "${value}"`
      }
      return `not ends_with(${typeKey}, "${value}")`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('not_ends_with', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'not_ends_with',
          value: list[1],
        }
      }
      const { match: match1, list: list1 } = getMatchReg('not_ends_with_json_string', str)
      if (match1) {
        return {
          type: 'lookup_json_string',
          name: list1[0],
          opt: 'not_ends_with',
          value: list1[1],
        }
      }
      return null
    },
  },
  in: {
    valueFormat: (typeKey, name, value) => {
      if (isShowName(typeKey, 'in')) {
        return `any(${typeKey}["${name || ''}"][*] in {${value.map(v => `"${v}"`).join(' ') || '""'}})`
      }
      if (getRuleConfig({ type: typeKey, opt: 'eq' }).valueType === 'input-number' || typeKey === 'ip.src') {
        return `${typeKey} in {${value.map(v => `${v}`).join(' ') || ''}}`
      }
      if (typeKey === 'cf.bot_management.detection_ids') {
        return `any(${typeKey}[*] in {${value.map(v => `${v}`).join(' ') || ''}})`
      }
      if (typeKey === 'lookup_json_string') {
        return `lookup_json_string(http.request.body.raw, "${name}") in {${value.map(v => `"${v}"`).join(' ') || '""'}}`
      }
      return `${typeKey} in {${value.map(v => `"${v}"`).join(' ') || '""'}}`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('name_in', str)
      if (match) {
        const valueArr = []
        const ls = list[2].split(/\s+/)
        ls.forEach(v => {
          if (v.startsWith('"') && v.endsWith('"')) {
            valueArr.push(removeQuotes(v))
          } else {
            valueArr.push(v)
          }
        })
        return {
          type: list[0],
          name: list[1],
          opt: 'in',
          value: valueArr,
        }
      }
      const { match: match2, list: list2 } = getMatchReg('in_string', str)
      if (match2) {
        const valueArr = []
        const list = list2[1].split(/\s+/)
        list.forEach(v => {
          if (v.startsWith('"') && v.endsWith('"')) {
            valueArr.push(removeQuotes(v))
          } else {
            valueArr.push(v)
          }
        })
        if (list2[0] === 'cf.verified_bot_category') {
          if (valueArr.some(v => !BOT_CATEGORIES.some(item => item.key === v))) return null
        }
        return {
          type: list2[0],
          name: undefined,
          opt: 'in',
          value: valueArr,
        }
      }
      const { match: match3, list: list3 } = getMatchReg('in_ips', str)
      const regex = /^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\s*)*)$/
      if (match3 && list3[1] && regex.test(list3[1])) {
        return {
          type: list3[0],
          name: undefined,
          opt: 'in',
          value: list3[1].trim().split(/\s+/),
        }
      }
      const { match: match1, list: list1 } = getMatchReg('in_number', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'in',
          value: list1[1].trim().split(/\s+/).map(v => v ? Number(v) : undefined),
        }
      }
      const { match: match4, list: list4 } = getMatchReg('in_select_number', str)
      if (str.includes('cf.bot_management.detection_ids') && match4) {
        return {
          type: list4[0],
          name: undefined,
          opt: 'in',
          value: list4[1].trim().split(/\s+/).map(v => Number(v)),
        }
      }
      const { match: match5, list: list5 } = getMatchReg('in_json_string', str)
      if (match5) {
        return {
          type: 'lookup_json_string',
          name: list5[0],
          opt: 'in',
          value: list5[1].trim().split(/\s+/).map(v => removeQuotes(v)),
        }
      }
      return null
    },
  },
  not_in: {
    valueFormat: (typeKey, name, value) => {
      if (isShowName(typeKey, 'not_in')) {
        return `not any(${typeKey}["${name || ''}"][*] in {${value.map(v => `"${v}"`).join(' ') || '""'}})`
      }
      if (getRuleConfig({ type: typeKey, opt: 'ne' }).valueType === 'input-number' || typeKey === 'ip.src') {
        return `not ${typeKey} in {${value.map(v => `${v}`).join(' ') || ''}}`
      }
      if (typeKey === 'cf.bot_management.detection_ids') {
        return `not any(${typeKey}[*] in {${value.map(v => `${v}`).join(' ') || ''}})`
      }
      if (typeKey === 'lookup_json_string') {
        return `not lookup_json_string(http.request.body.raw, "${name}") in {${value.map(v => `"${v}"`).join(' ') || '""'}}`
      }
      return `not ${typeKey} in {${value.map(v => `"${v}"`).join(' ') || '""'}}`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('not_name_in', str)
      if (match) {
        const valueArr = []
        const ls = list[2].split(/\s+/)
        ls.forEach(v => {
          if (v.startsWith('"') && v.endsWith('"')) {
            valueArr.push(removeQuotes(v))
          } else {
            valueArr.push(v)
          }
        })
        return {
          type: list[0],
          name: list[1],
          opt: 'not_in',
          value: valueArr,
        }
      }
      const { match: match2, list: list2 } = getMatchReg('not_in_string', str)
      if (match2) {
        const valueArr = []
        const ls = list2[1].split(/\s+/)
        ls.forEach(v => {
          if (v.startsWith('"') && v.endsWith('"')) {
            valueArr.push(removeQuotes(v))
          } else {
            valueArr.push(v)
          }
        })
        if (list2[0] === 'cf.verified_bot_category') {
          if (valueArr.some(v => !BOT_CATEGORIES.some(item => item.key === v))) return null
        }
        return {
          type: list2[0],
          name: undefined,
          opt: 'not_in',
          value: valueArr,
        }
      }
      const { match: match3, list: list3 } = getMatchReg('not_in_ips', str)
      const regex = /^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\s*)*)$/
      if (match3 && list3[1] && regex.test(list3[1])) {
        return {
          type: list3[0],
          name: undefined,
          opt: 'not_in',
          value: list3[1].trim().split(/\s+/),
        }
      }
      const { match: match1, list: list1 } = getMatchReg('not_in_number', str)
      if (match1) {
        return {
          type: list1[0],
          name: undefined,
          opt: 'not_in',
          value: list1[1].trim().split(/\s+/).map(v => v ? Number(v) : undefined),
        }
      }
      const { match: match4, list: list4 } = getMatchReg('not_in_select_number', str)
      if (str.includes('cf.bot_management.detection_ids') && match4) {
        return {
          type: list4[0],
          name: undefined,
          opt: 'not_in',
          value: list4[1].trim().split(/\s+/).map(v => Number(v)),
        }
      }
      const { match: match5, list: list5 } = getMatchReg('not_in_json_string', str)
      if (match5) {
        return {
          type: 'lookup_json_string',
          name: list5[0],
          opt: 'not_in',
          value: list5[1].trim().split(/\s+/).map(v => removeQuotes(v)),
        }
      }
      return null
    },
  },
  gt: {
    valueFormat: (typeKey, name, value) => `${typeKey} gt ${value}`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('gt', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'gt',
          value: list[1] ? Number(list[1]) : undefined,
        }
      }
      return null
    },
  },
  lt: {
    valueFormat: (typeKey, name, value) => `${typeKey} lt ${value}`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('lt', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'lt',
          value: list[1] ? Number(list[1]) : undefined,
        }
      }
      return null
    },
  },
  ge: {
    valueFormat: (typeKey, name, value) => `${typeKey} ge ${value}`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('ge', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'ge',
          value: list[1] ? Number(list[1]) : undefined,
        }
      }
      return null
    },
  },
  le: {
    valueFormat: (typeKey, name, value) => `${typeKey} le ${value}`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('le', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'le',
          value: list[1] ? Number(list[1]) : undefined,
        }
      }
      return null
    },
  },
  in_list: {
    valueFormat: (typeKey, name, value) => {
      if (typeKey === 'ip.src') {
        return `${typeKey} in $${value}`
      }
      return `${typeKey} in $${value.map(v => `"${v}"`).join(' ') || '""'}`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('in_list', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'in_list',
          value: list[1],
        }
      }
      return null
    },
  },
  not_in_list: {
    valueFormat: (typeKey, name, value) => {
      if (typeKey === 'ip.src') {
        return `not ${typeKey} in $${value}`
      }
      return `not ${typeKey} in $${value.map(v => `"${v}"`).join(' ') || '""'}`
    },
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('not_in_list', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'not_in_list',
          value: list[1],
        }
      }
      return null
    },
  },
  switch_eq: {
    valueFormat: (typeKey, name, value) => `${value ? '' : 'not '}${typeKey}`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('switch_eq', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'switch_eq',
          value: true,
        }
      }
      return null
    },
  },
  len: {
    valueFormat: (typeKey, name, value) => `len(${typeKey}["${value}"]) > 0`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('len', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'len',
          value: list[1],
        }
      }
      return null
    },
  },
  not_len: {
    valueFormat: (typeKey, name, value) => `not len(${typeKey}["${value}"]) > 0`,
    decodeDescription: (str) => {
      const { match, list } = getMatchReg('not_len', str)
      if (match) {
        return {
          type: list[0],
          name: undefined,
          opt: 'not_len',
          value: list[1],
        }
      }
      return null
    },
  },
}

export const RULE_ACTIONS = [
  {
    key: 'managed_challenge',
    label: i18n.t('network.waf.rule_action.managed_challenge'),
  },
  {
    key: 'log',
    label: i18n.t('network.waf.rule_action.log'),
  },
  {
    key: 'block',
    label: i18n.t('network.waf.rule_action.block'),
  },
  {
    key: 'allow',
    label: i18n.t('network.waf.rule_action.allow'),
  },
  {
    key: 'js_challenge',
    label: i18n.t('network.waf.rule_action.js_challenge'),
  },
  {
    key: 'skip',
    label: i18n.t('network.waf.rule_action.skip'),
  },
  {
    key: 'challenge',
    label: i18n.t('network.waf.rule_action.challenge'),
  },
]

export const BLOCK_TYPES = [
  {
    key: 'default',
    label: i18n.t('network.waf.block_type.default'),
  },
  {
    key: 'text/html',
    label: i18n.t('network.waf.block_type.text_html'),
  },
  {
    key: 'text/plain',
    label: i18n.t('network.waf.block_type.text_plain'),
  },
  {
    key: 'application/json',
    label: i18n.t('network.waf.block_type.application_json'),
  },
  {
    key: 'text/xml',
    label: i18n.t('network.waf.block_type.text_xml'),
  },
]
