const fs = require('fs')
const struct = require('bufferpack')
async function convertOpenMV (quant, path) {
  const openmvLayerType = {
    'Data': 0,
    'Conv2D': 1,
    'Relu': 2,
    'MaxPooling2D': 3,
    'Dense': 4
  }
  const openmvLayers = []

  // push the input layer
  openmvLayers.push({
    'layerType': 'Data',
    'shape': [64, 28, 28, 3], // nhwc
    'r_mean': 0x7d,
    'g_mean': 0x7b,
    'b_mean': 0x72,
    'scale': 8
  })
  console.log(quant)
  for (let i = 0; i < quant.length; i++) {
    let layer = quant[i]
    switch (layer.layerType) {
      case 'Conv2D':
        openmvLayers.push(quant[i])
        openmvLayers.push({
          'layerType': 'Relu',
          'shape': layer.outputShape.shape
        })
        break
      case 'MaxPooling2D':
        openmvLayers.push(quant[i])
        break
      case 'Flatten':
        // openmvLayers.push(quant[i])
        break
      case 'Dense':
        openmvLayers.push(quant[i])
        break
      default:
        console.log(i, layer.layerType, 'layer not support!')
        break
    }
  }
  let fout = fs.openSync(path, 'w+')
  fs.writeSync(fout, 'TFJS', 0, 'ascii') // write T F J S
  fs.closeSync(fout)
  fout = fs.openSync(path, 'a+')
  fs.writeSync(fout, struct.pack('<i', [openmvLayers.length]))
  console.log(openmvLayers)
  for (let i = 0; i < openmvLayers.length; i++) {
    let layer = openmvLayers[i]
    let layerType = layer.layerType
    // if (!layerType == openmvLayerType){
    //   console.log('NOTE: skipping layer: ', layerType)
    //   continue
    // }
    console.log('layer: ', i)
    // Write layer type code
    fs.writeSync(fout, struct.pack('<i', [openmvLayerType[layerType]]))
    if (layerType === 'Dense') {
      // Write layer shape (n, c, h, w)
      fs.writeSync(fout, struct.pack('<i', [64])) // n
      fs.writeSync(fout, struct.pack('<i', [1])) // c
      fs.writeSync(fout, struct.pack('<i', [1])) // h
      fs.writeSync(fout, struct.pack('<i', [layer.shape[1]])) // w
    } else {
      // Write layer shape (n, c, h, w)
      fs.writeSync(fout, struct.pack('<i', [64])) // n
      fs.writeSync(fout, struct.pack('<i', [layer.shape[3]])) // c
      fs.writeSync(fout, struct.pack('<i', [layer.shape[1]])) // h
      fs.writeSync(fout, struct.pack('<i', [layer.shape[2]])) // w
    }

    if (layerType === 'Data') {
      // Write r_mean, g_mean, b_mean, scale
      fs.writeSync(fout, struct.pack('<4i', [layer.r_mean, layer.g_mean, layer.b_mean, layer.scale]))
    }

    if (layerType === 'MaxPooling2D') {
      // Write pool type
      fs.writeSync(fout, struct.pack('<i', [openmvLayerType[layerType]]))
    }

    if (layerType === 'Conv2D' || layerType === 'Dense') {
      // Write lshift, rshift
      fs.writeSync(fout, struct.pack('<i', [Math.max(0, layer.lshift)]))
      fs.writeSync(fout, struct.pack('<i', [Math.max(0, layer.rshift)]))
    }

    if (layerType === 'Conv2D' || layerType === 'MaxPooling2D') {
      // Write k_size, k_pad, k_stride
      console.log('kernelSize', layer.kernelSize)
      fs.writeSync(fout, struct.pack('<i', layer.kernelSize || [0]))
      fs.writeSync(fout, struct.pack('<i', layer.padding || [0]))
      fs.writeSync(fout, struct.pack('<i', layer.stride || [0]))
    }

    if (layerType === 'Conv2D' || layerType === 'Dense') {
      // tf.js is HWC
      // Write weights size and array
      let wsData = await layer.ws.data.data()
      fs.writeSync(fout, struct.pack('<i', [wsData.length]))
      fs.writeSync(fout, struct.pack('<' + wsData.length + 'b', wsData))
      // console.log(wsData)
      // console.log(struct.pack('<'+wsData.length+'b', wsData))
      // Write bias size and array
      let biasData = await layer.bias.data.data()
      fs.writeSync(fout, struct.pack('<i', [biasData.length]))
      fs.writeSync(fout, struct.pack('<' + biasData.length + 'b', biasData))
    }
  }
  fs.closeSync(fout)
}

export { convertOpenMV }
