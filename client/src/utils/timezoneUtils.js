// Country to timezone mapping (frontend version)
const countryTimezones = {
  'US': 'America/New_York',
  'CA': 'America/Toronto',
  'GB': 'Europe/London',
  'DE': 'Europe/Berlin',
  'FR': 'Europe/Paris',
  'IT': 'Europe/Rome',
  'ES': 'Europe/Madrid',
  'NL': 'Europe/Amsterdam',
  'BE': 'Europe/Brussels',
  'CH': 'Europe/Zurich',
  'AT': 'Europe/Vienna',
  'SE': 'Europe/Stockholm',
  'NO': 'Europe/Oslo',
  'DK': 'Europe/Copenhagen',
  'FI': 'Europe/Helsinki',
  'PL': 'Europe/Warsaw',
  'CZ': 'Europe/Prague',
  'HU': 'Europe/Budapest',
  'RO': 'Europe/Bucharest',
  'BG': 'Europe/Sofia',
  'HR': 'Europe/Zagreb',
  'SI': 'Europe/Ljubljana',
  'SK': 'Europe/Bratislava',
  'LT': 'Europe/Vilnius',
  'LV': 'Europe/Riga',
  'EE': 'Europe/Tallinn',
  'IE': 'Europe/Dublin',
  'PT': 'Europe/Lisbon',
  'GR': 'Europe/Athens',
  'CY': 'Asia/Nicosia',
  'MT': 'Europe/Malta',
  'LU': 'Europe/Luxembourg',
  'IS': 'Atlantic/Reykjavik',
  'AU': 'Australia/Sydney',
  'NZ': 'Pacific/Auckland',
  'JP': 'Asia/Tokyo',
  'KR': 'Asia/Seoul',
  'CN': 'Asia/Shanghai',
  'IN': 'Asia/Kolkata',
  'SG': 'Asia/Singapore',
  'MY': 'Asia/Kuala_Lumpur',
  'TH': 'Asia/Bangkok',
  'VN': 'Asia/Ho_Chi_Minh',
  'PH': 'Asia/Manila',
  'ID': 'Asia/Jakarta',
  'BR': 'America/Sao_Paulo',
  'MX': 'America/Mexico_City',
  'AR': 'America/Argentina/Buenos_Aires',
  'CL': 'America/Santiago',
  'CO': 'America/Bogota',
  'PE': 'America/Lima',
  'VE': 'America/Caracas',
  'EC': 'America/Guayaquil',
  'UY': 'America/Montevideo',
  'PY': 'America/Asuncion',
  'BO': 'America/La_Paz',
  'GY': 'America/Guyana',
  'SR': 'America/Paramaribo',
  'GF': 'America/Cayenne',
  'ZA': 'Africa/Johannesburg',
  'EG': 'Africa/Cairo',
  'NG': 'Africa/Lagos',
  'KE': 'Africa/Nairobi',
  'GH': 'Africa/Accra',
  'MA': 'Africa/Casablanca',
  'TN': 'Africa/Tunis',
  'DZ': 'Africa/Algiers',
  'LY': 'Africa/Tripoli',
  'SD': 'Africa/Khartoum',
  'ET': 'Africa/Addis_Ababa',
  'UG': 'Africa/Kampala',
  'TZ': 'Africa/Dar_es_Salaam',
  'ZM': 'Africa/Lusaka',
  'ZW': 'Africa/Harare',
  'BW': 'Africa/Gaborone',
  'NA': 'Africa/Windhoek',
  'MZ': 'Africa/Maputo',
  'MG': 'Indian/Antananarivo',
  'MU': 'Indian/Mauritius',
  'SC': 'Indian/Mahe',
  'RE': 'Indian/Reunion',
  'IL': 'Asia/Jerusalem',
  'TR': 'Europe/Istanbul',
  'AE': 'Asia/Dubai',
  'SA': 'Asia/Riyadh',
  'QA': 'Asia/Qatar',
  'KW': 'Asia/Kuwait',
  'BH': 'Asia/Bahrain',
  'OM': 'Asia/Muscat',
  'JO': 'Asia/Amman',
  'LB': 'Asia/Beirut',
  'SY': 'Asia/Damascus',
  'IQ': 'Asia/Baghdad',
  'IR': 'Asia/Tehran',
  'AF': 'Asia/Kabul',
  'PK': 'Asia/Karachi',
  'BD': 'Asia/Dhaka',
  'LK': 'Asia/Colombo',
  'NP': 'Asia/Kathmandu',
  'BT': 'Asia/Thimphu',
  'MM': 'Asia/Yangon',
  'LA': 'Asia/Vientiane',
  'KH': 'Asia/Phnom_Penh',
  'MN': 'Asia/Ulaanbaatar',
  'KZ': 'Asia/Almaty',
  'UZ': 'Asia/Tashkent',
  'KG': 'Asia/Bishkek',
  'TJ': 'Asia/Dushanbe',
  'TM': 'Asia/Ashgabat',
  'AZ': 'Asia/Baku',
  'GE': 'Asia/Tbilisi',
  'AM': 'Asia/Yerevan',
  'RU': 'Europe/Moscow',
  'UA': 'Europe/Kiev',
  'BY': 'Europe/Minsk',
  'MD': 'Europe/Chisinau',
  'RS': 'Europe/Belgrade',
  'ME': 'Europe/Podgorica',
  'BA': 'Europe/Sarajevo',
  'MK': 'Europe/Skopje',
  'AL': 'Europe/Tirane',
  'XK': 'Europe/Belgrade', // Kosovo
  'AD': 'Europe/Andorra',
  'MC': 'Europe/Monaco',
  'LI': 'Europe/Vaduz',
  'SM': 'Europe/San_Marino',
  'VA': 'Europe/Vatican',
  'MT': 'Europe/Malta',
  'GI': 'Europe/Gibraltar',
  'FO': 'Atlantic/Faroe',
  'GL': 'America/Godthab',
  'SJ': 'Arctic/Longyearbyen',
  'AX': 'Europe/Mariehamn', // Åland Islands
  'IM': 'Europe/Isle_of_Man',
  'JE': 'Europe/Jersey',
  'GG': 'Europe/Guernsey',
  'BL': 'America/St_Barthelemy',
  'MF': 'America/Marigot',
  'GP': 'America/Guadeloupe',
  'MQ': 'America/Martinique',
  'RE': 'Indian/Reunion',
  'YT': 'Indian/Mayotte',
  'NC': 'Pacific/Noumea',
  'PF': 'Pacific/Tahiti',
  'WF': 'Pacific/Wallis',
  'CK': 'Pacific/Rarotonga',
  'NU': 'Pacific/Niue',
  'TK': 'Pacific/Fakaofo',
  'TO': 'Pacific/Tongatapu',
  'WS': 'Pacific/Apia',
  'FJ': 'Pacific/Fiji',
  'VU': 'Pacific/Efate',
  'SB': 'Pacific/Guadalcanal',
  'PG': 'Pacific/Port_Moresby',
  'KI': 'Pacific/Tarawa',
  'TV': 'Pacific/Funafuti',
  'NR': 'Pacific/Nauru',
  'PW': 'Pacific/Palau',
  'FM': 'Pacific/Pohnpei',
  'MH': 'Pacific/Majuro',
  'GU': 'Pacific/Guam',
  'MP': 'Pacific/Saipan',
  'AS': 'Pacific/Pago_Pago'
};

// Country name to country code mapping
const countryNameToCode = {
  'United States': 'US',
  'Canada': 'CA',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Slovenia': 'SI',
  'Slovakia': 'SK',
  'Lithuania': 'LT',
  'Latvia': 'LV',
  'Estonia': 'EE',
  'Ireland': 'IE',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Cyprus': 'CY',
  'Malta': 'MT',
  'Luxembourg': 'LU',
  'Iceland': 'IS',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'Japan': 'JP',
  'South Korea': 'KR',
  'China': 'CN',
  'India': 'IN',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Thailand': 'TH',
  'Vietnam': 'VN',
  'Philippines': 'PH',
  'Indonesia': 'ID',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Ecuador': 'EC',
  'Uruguay': 'UY',
  'Paraguay': 'PY',
  'Bolivia': 'BO',
  'Guyana': 'GY',
  'Suriname': 'SR',
  'French Guiana': 'GF',
  'South Africa': 'ZA',
  'Egypt': 'EG',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Ghana': 'GH',
  'Morocco': 'MA',
  'Tunisia': 'TN',
  'Algeria': 'DZ',
  'Libya': 'LY',
  'Sudan': 'SD',
  'Ethiopia': 'ET',
  'Uganda': 'UG',
  'Tanzania': 'TZ',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
  'Botswana': 'BW',
  'Namibia': 'NA',
  'Mozambique': 'MZ',
  'Madagascar': 'MG',
  'Mauritius': 'MU',
  'Seychelles': 'SC',
  'Reunion': 'RE',
  'Israel': 'IL',
  'Turkey': 'TR',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'Qatar': 'QA',
  'Kuwait': 'KW',
  'Bahrain': 'BH',
  'Oman': 'OM',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'Syria': 'SY',
  'Iraq': 'IQ',
  'Iran': 'IR',
  'Afghanistan': 'AF',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Sri Lanka': 'LK',
  'Nepal': 'NP',
  'Bhutan': 'BT',
  'Myanmar': 'MM',
  'Laos': 'LA',
  'Cambodia': 'KH',
  'Mongolia': 'MN',
  'Kazakhstan': 'KZ',
  'Uzbekistan': 'UZ',
  'Kyrgyzstan': 'KG',
  'Tajikistan': 'TJ',
  'Turkmenistan': 'TM',
  'Azerbaijan': 'AZ',
  'Georgia': 'GE',
  'Armenia': 'AM',
  'Russia': 'RU',
  'Ukraine': 'UA',
  'Belarus': 'BY',
  'Moldova': 'MD',
  'Serbia': 'RS',
  'Montenegro': 'ME',
  'Bosnia and Herzegovina': 'BA',
  'North Macedonia': 'MK',
  'Albania': 'AL',
  'Kosovo': 'XK',
  'Andorra': 'AD',
  'Monaco': 'MC',
  'Liechtenstein': 'LI',
  'San Marino': 'SM',
  'Vatican City': 'VA',
  'Gibraltar': 'GI',
  'Faroe Islands': 'FO',
  'Greenland': 'GL',
  'Svalbard and Jan Mayen': 'SJ',
  'Åland Islands': 'AX',
  'Isle of Man': 'IM',
  'Jersey': 'JE',
  'Guernsey': 'GG',
  'Saint Barthélemy': 'BL',
  'Saint Martin': 'MF',
  'Guadeloupe': 'GP',
  'Martinique': 'MQ',
  'Mayotte': 'YT',
  'New Caledonia': 'NC',
  'French Polynesia': 'PF',
  'Wallis and Futuna': 'WF',
  'Cook Islands': 'CK',
  'Niue': 'NU',
  'Tokelau': 'TK',
  'Tonga': 'TO',
  'Samoa': 'WS',
  'Fiji': 'FJ',
  'Vanuatu': 'VU',
  'Solomon Islands': 'SB',
  'Papua New Guinea': 'PG',
  'Kiribati': 'KI',
  'Tuvalu': 'TV',
  'Nauru': 'NR',
  'Palau': 'PW',
  'Micronesia': 'FM',
  'Marshall Islands': 'MH',
  'Guam': 'GU',
  'Northern Mariana Islands': 'MP',
  'American Samoa': 'AS'
};

// Get timezone for a country name
export const getTimezoneForCountry = (countryName) => {
  const countryCode = countryNameToCode[countryName];
  return countryTimezones[countryCode] || 'UTC';
};

// Get timezone display name
export const getTimezoneDisplayName = (countryName) => {
  const timezone = getTimezoneForCountry(countryName);
  try {
    const date = new Date();
    const options = { timeZone: timezone, timeZoneName: 'long' };
    return new Intl.DateTimeFormat('en-US', options).formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value || timezone;
  } catch (error) {
    return timezone;
  }
};

// Convert UTC date to user's timezone
export const convertToUserTimezone = (utcDate, countryName) => {
  try {
    const timezone = getTimezoneForCountry(countryName);
    const date = new Date(utcDate);
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error converting timezone:', error);
    // Fallback to UTC
    return new Date(utcDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
};

// Get current time in user's timezone
export const getCurrentTimeInTimezone = (countryName) => {
  try {
    const timezone = getTimezoneForCountry(countryName);
    return new Date().toLocaleString('en-US', { timeZone: timezone });
  } catch (error) {
    console.error('Error getting current time in timezone:', error);
    return new Date().toISOString();
  }
};

// Calculate time difference in user's timezone
export const calculateTimeDifference = (utcDate, countryName) => {
  try {
    const timezone = getTimezoneForCountry(countryName);
    const now = new Date();
    const targetDate = new Date(utcDate);
    
    // Convert both dates to the user's timezone
    const nowInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const targetInTimezone = new Date(targetDate.toLocaleString('en-US', { timeZone: timezone }));
    
    const diffInMs = nowInTimezone.getTime() - targetInTimezone.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    return { diffInMs, diffInHours, diffInDays };
  } catch (error) {
    console.error('Error calculating time difference:', error);
    // Fallback to UTC calculation
    const now = new Date();
    const targetDate = new Date(utcDate);
    const diffInMs = now.getTime() - targetDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    return { diffInMs, diffInHours, diffInDays };
  }
}; 