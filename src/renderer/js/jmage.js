var bmp = require('bmp-js')
// var jpeg = require('jpeg-js')
// var png = require('pngjs')
var fs = require('fs')
const fileType = require('file-type')

function decode (path) {
  var img = fs.readFileSync(path)
  switch (fileType(img).mime) {
    case 'image/bmp':
      const abgr = bmp.decode(img).data // ABGR
      var rgb888 = []
      for (var i = 0; i < abgr.length; i += 4) {
        rgb888.push(abgr[i + 3] / 255) // R
        rgb888.push(abgr[i + 2] / 255) // G
        rgb888.push(abgr[i + 1] / 255) // B
      }
      return rgb888
    case 'image/png':
      return console.log('png')
    case 'image/jpeg':
      return console.log('jpeg')
    default:
      return console.log('error')
  }
}

export {decode}
