/**
* @license
* Copyright (c) Jason Go
*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*
* SPDX-License-Identifier: MPL-2.0
*/
/* global iFrameResize, parentIFrame */
;(function () {
  const ECF = function (url, config = {}) {
    config.resizer = Object.assign({
      log: false,
      checkOrigin: true,
      heightCalculationMethod: 'taggedElement',
      onMessage: ({ iframe, message }) => {
        if (message === 'ecfready') {
          document.getElementById(iframe.id + '-spinner').style.display = 'none'
          iframe.style.display = 'block'
          const animation = iframe.getAttribute('data-animation')
          if (animation !== 'none') {
            iframe.classList.add('animate__animated', animation)
          }
        }
      }
    }, config.resizer)

    config = Object.assign({
      width: '100%',
      height: 'auto',
      id: 'ecf-' + new Date().getTime(),
      spinner: true,
      animation: 'animate__fadeIn',
      hideFooter: true,
      insertPosition: 'afterend',
      insertInto: ''
    }, config)

    let ecfNode = null
    if (config.insertInto === '') {
      ecfNode = document.currentScript || (function () {
        const scripts = document.getElementsByTagName('script')
        return scripts[scripts.length - 1]
      })()
    } else {
      ecfNode = document.querySelector(config.insertInto)
    }

    if (config.animation !== 'none') {
      ecfNode.insertAdjacentHTML(config.insertPosition, '<style>@import url(https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css);</style>')
    }

    const spinner = `<div id="${config.id}-spinner" class=ecf-spinner style=text-align:center><svg height=32px version=1.0 viewBox="0 0 128 128"width=32px xml:space=preserve xmlns=http://www.w3.org/2000/svg xmlns:svg=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink><g><path d="M.6 57.54c5.73-6.23 17.33-15.5 33.66-12.35C55.4 48.5 64 63.95 64 63.95S42.42 65 30.28 83.63a38.63 38.63 0 0 0-3.4 32.15 64.47 64.47 0 0 1-5.52-4.44A63.64 63.64 0 0 1 .6 57.54z"fill=#ffcb02 /><path d="M65.32 29.05c7.65 19.98-1.44 35.18-1.44 35.18S52.2 46.05 30.03 44.85A38.6 38.6 0 0 0 .56 57.93 63.8 63.8 0 0 1 37.56 6c8.2 1.8 22.26 7.16 27.76 23.05z"fill=#ff9e02 /><path d="M94.92 47.7c-13.48 16.63-31.2 16.36-31.2 16.36s9.92-19.2-.13-39a38.6 38.6 0 0 0-26.18-19 63.78 63.78 0 0 1 63.52 6.03c2.56 8 4.98 22.85-6.05 35.6z"fill=#ff4b42 /><path d="M93.52 82.53C72.38 79.17 63.75 63.7 63.75 63.7s21.6-1.02 33.7-19.63a38.6 38.6 0 0 0 3.43-32.04 64.33 64.33 0 0 1 5.74 4.6 63.63 63.63 0 0 1 20.82 53.26c-5.62 6.2-17.34 15.8-33.94 12.6z"fill=#c063d6 /><path d="M62.5 99c-7.65-19.98 1.44-35.17 1.44-35.17S75.56 81.6 97.74 82.8a39.1 39.1 0 0 0 29.73-13.03 63.8 63.8 0 0 1-37.16 52.3c-8.2-1.8-22.25-7.15-27.8-23.06z"fill=#17a4f6 /><path d="M26.64 115.63C24 107.6 21.6 93.06 32.5 80.5c13.48-16.62 31.58-16.55 31.58-16.55s-9.6 19.06.44 38.86a38.82 38.82 0 0 0 26.05 19.17 63.78 63.78 0 0 1-63.93-6.3z"fill=#4fca24 /></g></svg></div><style>.ecf-spinner svg{animation:.4s linear infinite rotate;margin-top:40px;position:relative}@keyframes rotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}</style>`
    ecfNode.insertAdjacentHTML(config.insertPosition, spinner)
    if (!config.spinner) {
      document.querySelector(`#${config.id}-spinner`).style.display = 'none'
    }

    if (document.querySelector('#js-iframe-resizer') === null && config.height === 'auto') {
      const r = document.createElement('script')
      r.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.min.js'
      r.crossOrigin = 'anonymous'
      r.id = 'js-iframe-resizer'
      document.getElementsByTagName('head')[0].appendChild(r)
    }

    const sm = url.match(/\/offers\/(.{8})/)
    let iframeSrc = ''
    if (typeof sm[1] === 'string') {
      iframeSrc = config.resizer.checkOrigin ? 'https://' + window.location.hostname + '/offers/' + sm[1] + '/checkout' : url

      // Pass the coupon code from top window
      const coupon = (window.location.href.match(/coupon_code=(\w+)(&|$)/) || url.match(/coupon_code=(\w+)(&|$)/) || ['', ''])[1]
      iframeSrc += coupon === '' ? '' : '?coupon_code=' + coupon

      const i = document.createElement('iframe')
      i.id = config.id
      i.src = iframeSrc
      i.allow = 'payment'
      i.style.width = config.width
      i.frameBorder = '0'
      i.style.border = '0'
      i.style.display = 'none'
      i.style.minWidth = '330px'
      i.setAttribute('data-animation', config.animation)
      ecfNode.insertAdjacentElement(config.insertPosition, i)

      if (config.height === 'auto') {
        const ctrl = setInterval(function () {
          if (typeof iFrameResize === 'function') {
            clearInterval(ctrl)
            iFrameResize(config.resizer, '#' + i.id)
          }
        }, 10)
      } else {
        i.style.height = config.height
        document.getElementById(i.id + '-spinner').style.display = 'none'
        i.style.display = 'block'
        const animation = i.getAttribute('data-animation')
        if (animation !== 'none') {
          i.classList.add('animate__animated', animation)
        }
      }
    } else {
      return false
    }
  }
  window.ECF = window.ECF || ECF
  window.ecf = window.ecf || ECF

  const ok = f => document.readyState[7] ? f() : setTimeout(ok, 9, f)

  ok(function () {
    const $ = function (q) { return document.querySelectorAll(q) }
    if (document.body.classList.contains('offer-checkout') && (/\?embed$/.test(window.location.href) || window.top !== window.self) && !(/editor=true/.test(window.location.href)) && !(/\?noembed$/.test(window.location.href))) {
      window.JGO_ECF = true
      if (document.querySelector('#js-iframe-content') == null) {
        const r = document.createElement('script')
        r.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.2.11/iframeResizer.contentWindow.min.js'
        r.crossOrigin = 'anonymous'
        r.id = 'js-iframe-content'
        document.getElementsByTagName('head')[0].appendChild(r)
      }

      $('div.checkout-banner').length && $('div.checkout-banner')[0].remove()
      $('#new_checkout_offer').length && $('#new_checkout_offer')[0].setAttribute('data-iframe-height', '')
      $('div.col-md-6').length && $('div.col-md-6')[0].remove()
      $('div.checkout-content-left').length && $('div.checkout-content-left')[0].classList.remove('col-md-offset-1', 'col-md-5', 'checkout-content-left')
      $('div.content').length && $('div.content')[0].classList.remove('content')
      $('div.container').length && $('div.container')[0].classList.remove('container')
      $('div.row').length && $('div.row')[0].classList.remove('row')
      $('.checkout-footer').length && $('.checkout-footer')[0].remove()

      // Compatibility with 2-Step Checkout Styler
      const panelheadstyle = window.JGO_2step ? 'div.panel-heading{padding:0}div.panel-heading>*:not(div){padding:32px 36px 0 36px}' : 'div.panel-heading{padding:32px 36px 32px 36px}div.panel-heading>*:not(div):not(.checkout-panel-badge){padding:0}'

      const ecfstyle = document.createElement('style')
      ecfstyle.innerHTML =
`#preloader {width: 100% !important;height: 100% !important;left:0 !important;}
body {background-color:white}
div.checkout-panel {margin:0}
div.checkout-panel{box-shadow: 0 0 0 0 rgba(0,0,0,0.1)}
div.panel-body {padding:36px}
div.price-breakdown {padding: 17px 36px 17px 36px}
.grecaptcha-badge{visibility: hidden;}
${panelheadstyle}`

      document.body.append(ecfstyle)

      $('form')[0].setAttribute('target', '_top')
      const ctrl = setInterval(function () {
        if (typeof parentIFrame !== 'undefined') {
          clearInterval(ctrl)
          parentIFrame.sendMessage('ecfready')
        }
      }, 10)
    }
  })
})()
