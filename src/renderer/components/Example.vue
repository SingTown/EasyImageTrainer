<template>
  <Layout>
    <Header :style="{background: '#fff', boxShadow: '0 2px 3px 2px rgba(0,0,0,.1)'}"><h1>Example</h1></Header>
    <Content :style="{padding: '0 16px 16px'}">
      <Button type="success" v-on:click="creatNew()" long style="margin: 32px 0">Creat New Project</Button>
      <Card style="padding: 10px;background: #f8f8f9">
        <div slot="title" >
          load example
        </div>
        <div v-for = "e in exampleList" :key="e.title">
          <Button v-on:click="loadExample(e.title)" long style="margin: 32px 0">{{e.title}}</Button>
        </div>
      </Card>
    </Content>
  </Layout>
</template>

<script>
  import fs from 'fs-extra'
  import {shell} from 'electron'
  import sweetalert2 from 'sweetalert2'
  const path = require('path')
  const appPath = require('electron').remote.app.getAppPath()
  const appData = require('electron').remote.app.getPath('appData')
  const examplePath = path.join(appPath, 'ImageDatasetFolder')
  const starterPath = path.join(appPath, 'starter')
  const projectPath = path.join(appData, 'ImageTrainer')
  export default {
    name: 'example-page',
    data () {
      return {
        exampleList: []
      }
    },
    mounted: function () {
      if (!fs.pathExistsSync(projectPath)) {
        fs.mkdirSync(projectPath, 0o777)
      }
      this.refreshExample()
    },
    methods: {
      refreshExample: function () {
        let displayDir = []
        let list = fs.readdirSync(examplePath)
        list.forEach(function (dirName) {
          let stat = fs.statSync(path.join(examplePath, dirName))
          if (stat && stat.isDirectory()) {
            displayDir.push({
              title: dirName
            })
          }
        })
        this.exampleList = displayDir
      },
      loadExample: function (title) {
        if (fs.readdirSync(projectPath).length) {
          sweetalert2({
            title: 'you have not saved project',
            text: 'you want to save it?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!'
          }).then((result) => {
            if (result.value) {
              sweetalert2({
                title: 'copy or move folders for bakcup',
                text: 'The number of pictures may be a lot',
                confirmButtonText: 'OPEN',
                type: 'warning'
              }).then((result) => {
                if (result.value) {
                  const path = appPath + '/tmp/raw_data/'
                  shell.showItemInFolder(path)
                }
              })
            } else {
              sweetalert2({
                title: 'Time may be a bit long',
                text: 'The number of pictures may be a lot',
                confirmButtonText: 'RUN',
                type: 'warning'
              }).then((result) => {
                if (result.value) {
                  fs.emptyDirSync(projectPath)
                  fs.copySync(path.join(examplePath, title), projectPath)
                  this.$router.push({'path': '/Folder'})
                }
              })
            }
          })
        } else {
          sweetalert2({
            title: 'Time may be a bit long',
            text: 'The number of pictures may be a lot',
            confirmButtonText: 'RUN',
            type: 'warning'
          }).then((result) => {
            if (result.value) {
              fs.emptyDirSync(projectPath)
              fs.copySync(path.join(examplePath, title), projectPath)
              this.$router.push({'path': '/Folder'})
            }
          })
        }
      },
      creatNew: function () {
        if (fs.readdirSync(projectPath).length) {
          sweetalert2({
            title: 'you have not saved project',
            text: 'you want to save it?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!'
          }).then((result) => {
            if (result.value) {
              sweetalert2({
                title: 'copy or move folders for bakcup',
                text: 'The number of pictures may be a lot',
                confirmButtonText: 'OPEN',
                type: 'warning'
              }).then((result) => {
                if (result.value) {
                  const path = appPath + '/tmp/raw_data/'
                  shell.showItemInFolder(path)
                }
              })
            } else {
              fs.emptyDirSync(projectPath)
              fs.copySync(starterPath, projectPath)
              this.$router.push({'path': '/Folder'})
            }
          })
        } else {
          fs.emptyDirSync(projectPath)
          fs.copySync(starterPath, projectPath)
          this.$router.push({'path': '/Folder'})
        }
      }
    }
  }
</script>

<style scoped>
</style>

