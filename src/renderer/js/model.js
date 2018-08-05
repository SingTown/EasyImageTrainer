const tf = require('@tensorflow/tfjs')
// var ImageData = require('./data')

// function print(data) {
//   var frame = []
//   for(var i=0;i<data.length;i+=3){
//   if(data[i]+data[i+1]+data[i+2]){
//     frame[Math.floor(i/3)]=1
//   }else{
//     frame[Math.floor(i/3)]=0
//   }
//   }
//   var sa = ""
//   for(var j=0;j<frame.length;j++){
//   if(j%28==0){
//     sa+='\n'
//   }
//   sa+=frame[j]
//   }
//   console.log(sa)
// }
async function getModel (setting) {
  const model = tf.sequential()
  model.add(tf.layers.conv2d({
    inputShape: [setting.width, setting.height, setting.depth],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }))
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}))

  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }))
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}))

  model.add(tf.layers.flatten())

  model.add(tf.layers.dense(
    {units: setting.class_unit, kernelInitializer: 'varianceScaling', activation: 'softmax'}))

  const optimizer = tf.train.sgd(0.15)
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  })
  return model
}

export {getModel}
