let styleTag = document.createElement('style')
styleTag.id = 'debug-styles'
const button = document.createElement('button')
button.innerText = '🐛 on'
button.id = 'debug-button'
button.addEventListener('click', () => {
  document.body.classList.toggle('debug')
  button.classList.toggle('off')
  if (button.innerText == '🐛 on') {
    button.innerText = '🐛 off'
    unsetBgs()
  } else {
    button.innerText = '🐛 on'
    setStyles()
  }
})

const transparentGreen = '#81cc6e40'


// container styles
styleTag.innerHTML = `
  #debug-button {
    position: fixed;
    padding: 0px 10px
    left: 1em;
    bottom: .25em;
    border-radius: 50em;
    background: #00ff804e;
    border: 0;
  }
  #debug-button.off{
    filter: grayscale(1);
  }

  body.debug .container,
  body.debug .container-fluid {
    outline: 2px solid #00ffff;
    outline-offset: -1px;
  }`
  // row styles
  + `
  body.debug .row, data.debug [data-debug*=flex] {
    outline: 2px dashed rgb(174, 0, 255);
    outline-offset: -3px;
    background-color: rgba(174, 0, 255, .05);
  }`
  // row out of container
  + `
  body.debug *:not([class*="container"])>.row::before {
   ${elementError('row out of container. Wrap rows with container or container-fluid')}
  }`
  // row in direct row
  + `body.debug .row>.row::before{
    ${elementError('row nested directly in another row.')}
  }
  `
  // column
  + `
  body.debug [class*="col"] {
    outline: 2px dotted #00ff37;
    outline-offset: -3px;
  }`
  + `
  body.debug [class*=col]>[class*=col]::before{
    ${elementError('column nested directly in column, columns should only be children of rows')}
  }
  `
  // Position relative tag
  + `
  body.debug [data-debug*=relative]{
    outline: 2px dotted #ff0080!important;
  }
  body.debug [data-debug*=relative]::before{
    content: 'relative';
    font-size: .75rem;
    color: white;
    background: #ff008040;
    position:absolute;
    transform: translateY(-1.25rem);
    padding: 0 5px;
    border-radius: 50em;
  }
  `
  // Position absolute tag
  + `
  body.debug [data-debug*=absolute]{
    outline: 2px dotted #ffffff!important;
    outline-offset: -1px;
  }
  body.debug [data-debug*=absolute]::before{
    content: 'abs';
    font-size: .75rem;
    color: white;
    background: #ffffff40;
    position:absolute;
    top: 0;
    left: -4.5ch;
    padding: 0 5px;
    border-radius: 50em;
  }
  `
  + // ELEMENT out of bounds
  `
  body.debug [data-debug*=out-of-bounds]{
    outline: 4px double red !important;
    outline-offset: -4px !important;
  }

  body.debug [data-debug*=out-of-bounds]::after{
    ${elementError('Element Out of Bounds')}
    right:0;
  }`

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
  body.appendChild(button)
  body.append(styleTag)
  script = body.querySelector('#debug-script')
  allElms = body.querySelectorAll('*')
  containers = body.querySelectorAll('[class*=container]')
  rows = body.querySelectorAll('.row')
  cols = body.querySelectorAll('[class*=col]')
  flexibles = Array.from(allElms).filter(e => getStyle(e).display == 'flex')
  setStyles()
  horizontalScrollPolice()
}

function setStyles() {

  //cols
  cols.forEach(e => {
    let styles = getStyle(e)
    console.log(styles.backgroundColor)
    if (styles.backgroundColor == 'rgba(0, 0, 0, 0)') {
      e.style.backgroundColor = transparentGreen;
      console.log(getStyle(e).backgroundColor)
    }
  })

  // display flex
  flexibles.forEach(e => {
    e.setAttribute('data-debug', 'flex')
    let styles = getStyle(e)
    if (styles.backgroundImage == 'none') {
      e.style.backgroundImage = 'url(https://www.transparenttextures.com/patterns/axiom-pattern.png)'
    } else {
      e.style.backgroundImage = 'url(https://www.transparenttextures.com/patterns/axiom-pattern.png),' + styles.backgroundImage
      e.style.backgroundSize = '75px, ' + styles.backgroundSize
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

  const columns = Array.from(cols).filter(e => getStyle(e).backgroundColor == 'rgba(129, 204, 110, 0.25)')
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

/**
 * 
 * @param {HTMLElement} elm element
 * @return {CSSStyleDeclaration} style
 */
function getStyle(elm) {
  return window.getComputedStyle(elm)
}

if (document.body && document.body.classList.contains('debug')) {
  initialize()
} else {
  console.warn('Style Debugger is shut off. To turn on, add the class "debug" to the body and refresh.')
}
