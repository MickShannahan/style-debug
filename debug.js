let styleTag = document.createElement('style')
let debugMenuStyleTag = document.createElement('style')
debugMenuStyleTag.id = 'debug-menu-styles'
styleTag.id = 'debug-styles'

const button = document.createElement('button')
button.id = 'debug-button'
button.addEventListener('click', () => {
  if (settings[0].on) {
    settings[0].on = false
    document.body.classList.remove('debug')
    unsetBgs()
  } else {
    settings[0].on = true
    document.body.classList.add('debug')
    implementStyles()
  }
  saveSettings()
  drawButton()
})

const settingsButton = document.createElement('button')
settingsButton.id = 'debug-settings-button'
settingsButton.innerText = '⚙️'
settingsButton.setAttribute('title', 'open settings menu')
settingsButton.addEventListener('click', toggleSettingsMenu)

const settingsMenu = document.createElement('div')
settingsMenu.id = 'debug-settings-menu'
settingsMenu.setAttribute('class', 'd-none')


let settings = [
  { name: 'active', on: true }, // active is always first
  { name: 'menu open', on: false },
  { name: 'container outline', on: true, color: '#00ffff' },
  { name: 'row outline', on: true, color: '#ae00ff' },
  { name: 'column outline', on: true, color: '#00ff37' },
  { name: 'column color', on: true, color: '#81cc6e' },
  { name: 'flex lines', on: true },
  { name: 'relative visual', on: true, color: '#ff0080' },
  { name: 'absolute visual', on: true, color: '#e6b4fe' },
  { name: 'horizontal spill', on: true, },
  { name: 'image squash', on: true, },
]

function getSetting(setName, key = 'color') {
  const set = settings.find(s => s.name == setName)
  if (!set) console.error('no setting ' + setName)
  return set[key]
}

const isValidHex = (hex) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)
const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, "g"))
const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16)
function getAlphafloat(a, alpha) {
  if (typeof a !== "undefined") { return a / 255 }
  if ((typeof alpha != "number") || alpha < 0 || alpha > 1) {
    return 1
  }
  return alpha
}
function hexToRGBA(hex, alpha) {
  if (!isValidHex(hex)) { throw new Error("Invalid HEX") }
  const chunkSize = Math.floor((hex.length - 1) / 3)
  const hexArr = getChunksFromString(hex.slice(1), chunkSize)
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256)
  return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha).toFixed(2)})`
}

const hexTransparency = '40'

function menuStyles() {
  let menuColor = '#232323cc'
  let content = `
  #debug-button {
    position: fixed;
    padding: 0px 10px;
    left: 1em;
    bottom: .25em;
    border-radius: 50em;
    background: ${menuColor};
    backdrop-filter: blur(10px);
    color: #00ff37;
    border: 0;
  }
  #debug-button.off{
    filter: grayscale(1);
  }
  #debug-settings-button {
    background-color: ${menuColor};
    backdrop-filter: blur(10px);
    position: fixed;
    bottom: .25em;
    left: 5em;
    border: 0;
    border-radius: 50em;
    padding: 0 10px;
  }
  
  #debug-settings-menu {
    width: max-content;
    color: whitesmoke;
    font-size: 14px;
    padding: 5px;
    border-radius: 12px;
    background-color: ${menuColor};
    backdrop-filter: blur(10px);
    border: 1px gray;
    box-shadow: 0px 2px 2px #00000040;
    position: fixed;
    bottom: 2.5em;
    left: 1em;
  }
  
  #debug-settings-menu>div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    background-image: unset;
  }
  
  #debug-settings-menu input {
    accent-color: rgb(80, 66, 235);
  }
  
  #debug-settings-menu input[type*=color] {
    width: 30px;
    height: 1em;
    margin-left: 5px;
  }
  `
  debugMenuStyleTag.innerHTML = content
}

function implementStyles() {
  let content = ''
  //container-styles
  if (getSetting('container outline', 'on')) content += `
  body.debug .container,
  body.debug .container-fluid {
    outline: 2px solid ${getSetting('container outline')};
    outline-offset: -1px;
  }`
  // row styles
  if (getSetting('row outline', 'on')) content += `
  body.debug .row, data.debug [data-debug*=flex] {
    outline: 2px dashed ${getSetting('row outline')};
    outline-offset: -2px;
  }`
  // row out of container
  content += `
  body.debug *:not(:is([class*="container"], [class*=col]))>.row::before {
   ${elementError('row out of container. Wrap rows with container or container-fluid')}
  }`
  // row in direct row
  content += `body.debug .row>.row::before{
    ${elementError('row nested directly in another row.')}
  }
  `
  // column
  if (getSetting('column outline', 'on')) content += `
  body.debug [class*="col"] {
    outline: 2px dotted ${getSetting('column outline')};
    outline-offset: -3px;
  }`

  content += `
  body.debug [class*=col]>[class*=col]::before{
    ${elementError('column nested directly in column, columns should only be children of rows')}
  }
  `
  // Position relative tag
  if (getSetting('relative visual', 'on')) content += `
  body.debug [data-debug*=relative]{
    outline: 2px dotted ${getSetting('relative visual')}!important;
  }
  body.debug [data-debug*=relative]::before{
    content: 'relative';
    font-size: .75rem;
    color: white;
    background: ${getSetting('relative visual')}99;
    position:absolute;
    transform: translateY(-1.25rem);
    padding: 0 5px;
    border-radius: 50em;
  }
  `
  // Position absolute tag
  if (getSetting('absolute visual', 'on')) content += `
  body.debug [data-debug*=absolute]{
    outline: 2px dotted ${getSetting('absolute visual')}!important;
    outline-offset: -1px;
  }
  body.debug [data-debug*=absolute]::before{
    content: 'abs';
    font-size: .75rem;
    color: white;
    background: ${getSetting('absolute visual')}99;
    position:absolute;
    top: 0;
    left: -4.5ch;
    padding: 0 5px;
    border-radius: 50em;
  }
  `
  content += // ELEMENT out of bounds
    `
  body.debug [data-debug*=out-of-bounds]{
    outline: 4px double red !important;
    outline-offset: -4px !important;
  }

  body.debug [data-debug*=out-of-bounds]::after{
    ${elementError('Element Out of Bounds')}
    right:0;
  }`
  // IMAGE squash
  if (getSetting('image squash', 'on')) content +=
    `
  body.debug [data-debug*=img-squash]{
    outline: 2px solid red;
  }
  `


  styleTag.innerHTML = content
  computedStyles()
}


function elementError(message) {
  return `
  content: '⚠️${message}';
  padding: 2px;
  position: absolute;
  text-shadow: 1px 0px 1px #00000060;
  color: red;
  background-color: #ff000040 !important;`
}
let body, script, allElms, containers, rows, cols, flexibles;

function initialize() {
  body = document.body

  script = body.querySelector('#debug-script')
  allElms = body.querySelectorAll('*')
  containers = body.querySelectorAll('[class*=container]')
  rows = body.querySelectorAll('.row')
  cols = body.querySelectorAll('[class^=col-]')
  flexibles = Array.from(allElms).filter(e => getStyle(e).display == 'flex')
  body.appendChild(button)
  body.appendChild(settingsButton)
  body.appendChild(settingsMenu)
  body.append(styleTag)
  body.append(debugMenuStyleTag)

  menuStyles()
  implementStyles()
  drawButton()
  drawMenu()

  if (!getSetting('active', 'on')) {
    document.body.classList.remove('debug')
    unsetBgs()
  }
}

function computedStyles() {
  unsetBgs()
  //cols
  if (getSetting('column color', 'on')) {
    cols.forEach(e => {
      let styles = getStyle(e)
      if (styles.backgroundColor == 'rgba(0, 0, 0, 0)') {
        e.style.backgroundColor = getSetting('column color') + hexTransparency;
      }
    })
  }

  // display flex
  flexibles.forEach(e => {
    e.setAttribute('data-debug', 'flex')
    if (getSetting('flex lines', 'on')) {
      let styles = getStyle(e)
      if (styles.backgroundImage == 'none') {
        e.style.backgroundImage = 'url(https://www.transparenttextures.com/patterns/axiom-pattern.png)'
      } else {
        e.style.backgroundImage = 'url(https://www.transparenttextures.com/patterns/axiom-pattern.png),' + styles.backgroundImage
        e.style.backgroundSize = '75px, ' + styles.backgroundSize
      }
    }
  })

  // relative and absolutes
  const relatives = Array.from(allElms).filter(e => getStyle(e).position == 'relative')
  const absolutes = Array.from(allElms).filter(e => getStyle(e).position == 'absolute')
  relatives.forEach((e, i) => {
    e.setAttribute('data-debug', 'relative')
    e.style.outlineOffset = (parseInt(getStyle(e).padding) * -1) + 'px'
  })
  absolutes.forEach(e => e.setAttribute('data-debug', 'absolute'))

  if (getSetting('horizontal spill', 'on')) horizontalScrollPolice()
  if (getSetting('image squash', 'on')) imageSquashPolice()
}


function unsetBgs() {
  const flexs = Array.from(flexibles).filter(e => getStyle(e).backgroundImage.includes('transparenttextures.com'))
  flexs.forEach(e => {
    let imgs = getStyle(e).backgroundImage.split(',').slice(1)
    let sizes = getStyle(e).backgroundSize.split(',').slice(1)
    if (imgs.length) {
      e.style.backgroundImage = imgs.join(',')
      e.style.backgroundSize = sizes.join(',')
    } else {
      e.style.backgroundImage = 'unset'
    }
  })
  let hex = getSetting('column color') + hexTransparency
  const columns = Array.from(cols).filter(e => {
    return getStyle(e).backgroundColor == hexToRGBA(hex)
  })
  columns.forEach(e => {
    e.style.backgroundColor = 'rgba(0, 0, 0, 0)'
  })
}

function horizontalScrollPolice() {
  let maxWidth = window.innerWidth
  allElms.forEach(elm => {
    let dimensions = elm.getBoundingClientRect()
    // let {top, bottom, left, right, width, height} = elm.getBoundingClientRect()
    if (dimensions.left + dimensions.width > maxWidth) {
      elm.setAttribute('data-debug', 'out-of-bounds')
    }
  })
}

function imageSquashPolice() {
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if ((img.offsetWidth / img.offsetHeight).toFixed(2) != (img.naturalWidth / img.naturalHeight).toFixed(2)) {
      let styles = getStyle(img)
      if (styles.objectFit == 'fill') {
        img.setAttribute('data-debug', 'img-squash')
        console.warn('⚠️ squashed image alert ⬇️')
        console.log(img)
      }
    }
  })
}

/**
 * 
 * @param {HTMLElement} elm element
 * @return {CSSStyleDeclaration} style
 */
function getStyle(elm) {
  return window.getComputedStyle(elm)
}

function drawButton() {
  if (getSetting('active', 'on')) {
    button.innerText = '🐛 on'
    button.classList.remove('off')
  } else {
    button.innerText = '🐛 off'
    button.classList.add('off')
  }
}

function drawMenu() {
  let menu = ''
  settings.slice(1).forEach(set => {
    menu += `
  <div>
    <div>
      <input type="checkbox" ${set.on ? 'checked' : ''} onchange="toggleSetting('${set.name}')"/> ${set.name}
    </div>
    <div>
    ${set.color ? `<input type="color" value="${set.color}" onchange="changeSetting('${set.name}', 'color', event)">` : ''}
    </div>
  </div>`
  })
  document.getElementById('debug-settings-menu').innerHTML = menu
}

function toggleSettingsMenu() {
  if (getSetting('menu open', 'on')) {
    settingsButton.innerText = '⚙️'
    console.log('🐛debug settings saved')
    settings[0].on = false
    saveSettings()
  } else {
    settingsButton.innerText = '💾'
    settings[0].on = true
  }
  document.getElementById('debug-settings-menu').classList.toggle('d-none')
}

function toggleSetting(setting, redraw = true) {
  let set = settings.find(s => s.name == setting)
  set.on = !set.on
  if (redraw) implementStyles()
}

function changeSetting(setting, type, e) {
  let newVal = e.target.value
  let set = settings.find(s => s.name == setting)
  set.on = false
  computedStyles()
  set[type] = newVal
  set.on = true
  implementStyles()
}

// local storage
function saveSettings() {
  let data = JSON.stringify(settings)
  localStorage.setItem('debug-settings', data)
}

function loadSettings() {
  let data = localStorage.getItem('debug-settings')
  if (data) {
    settings = JSON.parse(data)
  }
}


// INITIALIZE
if (document.body && document.body.classList.contains('debug')) {
  loadSettings()
  initialize()
} else {
  console.warn('Style Debugger is shut off. To turn on, add the class "debug" to the body and refresh.')
}


