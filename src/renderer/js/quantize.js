// const tf = require('@tensorflow/tfjs')
async function quantize (model, dataSet) {
  var quant = []
  function quantizeInit () {
    quant = []
    const layers = model.layers
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i]
      quant.push({
        layerType: layer.getClassName(),
        shape: layer.input.shape,
        outputShape: layer.output,
        kernelSize: layer.kernelSize,
        padding: [2, 2], // layer.padding,
        stride: layer.strides
      })
    }
  }
  async function getQnumber (tensor) {
    var min = await tensor.min().data()
    var max = await tensor.max().data()
    var intBits = Math.ceil(Math.log2(Math.max(Math.abs(min), Math.abs(max))))
    var decBits = 7 - intBits
    var qdata = tensor.mul(Math.pow(2, decBits)).round()
    // var quant = qdata.div(Math.pow(2, decBits))
    return [qdata, decBits]
  }
  async function quantizeWS8bit () {
    const layers = model.layers
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i]
      var type = layer.getClassName()
      if (type === 'Conv2D' || type === 'Dense') {
        quant[i]['ws'] = {}
        var q = await getQnumber(layer.getWeights()[0])
        quant[i]['ws']['data'] = q[0]
        quant[i]['ws']['bit'] = q[1]
      }
    }
  }
  async function quantizeBias8bit () {
    const layers = model.layers
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i]
      var type = layer.getClassName()
      if (type === 'Conv2D' || type === 'Dense') {
        quant[i]['bias'] = {}
        var q = await getQnumber(layer.getWeights()[1])
        quant[i]['bias']['data'] = q[0]
        quant[i]['bias']['bit'] = q[1]
      }
    }
  }
  async function quantizeData8bit () {
    // input and output
    var input = dataSet[0]
    const layers = model.layers
    for (var i = 0; i < layers.length; i++) {
      // input
      var layer = layers[i]
      var q = await getQnumber(input)
      quant[i]['input'] = {}
      quant[i]['input']['data'] = q[0]
      quant[i]['input']['bit'] = q[1]
      var output = await layer.apply(input)
      // output
      quant[i]['output'] = {}
      q = await getQnumber(output)
      quant[i]['output']['data'] = q[0]
      quant[i]['output']['bit'] = q[1]
      input = output
    }
  }
  quantizeInit()
  await quantizeWS8bit()
  await quantizeData8bit()
  await quantizeBias8bit()
  const layers = model.layers
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i]
    var type = layer.getClassName()
    if (type === 'Conv2D' || type === 'Dense') {
      quant[i].lshift = quant[i].input.bit + quant[i].ws.bit - quant[i].bias.bit
      quant[i].rshift = quant[i].input.bit + quant[i].ws.bit - quant[i].output.bit
    }
  }
  return quant
}
async function evaluate (model, quant, dataSet) {
  let [xs, labels] = dataSet
  let [loss, acc] = model.evaluate(xs, labels, {batchSize: 64})
  let rawLoss = await loss.data()
  let rawAcc = await acc.data()
  const layers = model.layers
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i]
    var w = layer.getWeights()
    var type = layer.getClassName()
    if (type === 'Conv2D' || type === 'Dense') {
      w[0] = quant[i].ws.data.div(Math.pow(2, quant[i].ws.bit))
      w[1] = quant[i].bias.data.div(Math.pow(2, quant[i].bias.bit))
      model.layers[i].setWeights(w)
    }
  }
  [loss, acc] = model.evaluate(xs, labels, {batchSize: 64})
  let qLoss = await loss.data()
  let qAcc = await acc.data()
  return [rawLoss, rawAcc, qLoss, qAcc]
}

export {quantize, evaluate}
