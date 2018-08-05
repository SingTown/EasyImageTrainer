<template>
  <Layout>
    <Header :style="{background: '#fff', boxShadow: '0 2px 3px 2px rgba(0,0,0,.1)'}"><h1>image manage</h1></Header>
    <Content :style="{padding: '0 16px 16px'}">
      <div class="folders" v-for="dir in displayDir" :key="dir.title" style="padding: 20px;display:inline-block;">
        <Card style="width: 250px;" v-on:drop="add_image($event)">
          <div slot="title" >
          <Tooltip content="click to rename">
            <Button v-on:click="rename_folder(dir.title)" type="text">{{dir.title}}</Button>
          </Tooltip>
            <Button v-on:click="remove_folder(dir.title)" type="text" icon="ios-trash" style="float: right;"></Button>
            <Button v-on:click="open_folder(dir.title)" type="text" icon="ios-folder-open" style="float: right;"></Button>
          </div>
          <Tooltip content="drag image into here">
            <p>sum picture:{{dir.sum}}</p>
            <p>id:{{dir.id}}</p>
          </Tooltip>
        </Card>
      </div>
      <Button type="primary" v-on:click="add_folder" shape="circle" icon="ios-add"></Button>
    </Content>
    <Layout>
      <Footer>
        <Button type="success" to="/Train" long style="margin: 32px 0">Next</Button>
      </Footer>
    </Layout>
  </Layout>
</template>

<script>
  import {shell} from 'electron'
  import sweetalert2 from 'sweetalert2'
  import fs from 'fs-extra'
  const path = require('path')
  const appData = require('electron').remote.app.getPath('appData')
  const projectPath = path.join(appData, 'ImageTrainer')

  document.addEventListener('dragover', function (event) {
    event.preventDefault()
    return false
  }, false)

  document.addEventListener('drop', function (event) {
    event.preventDefault()
    return false
  }, false)

  export default {
    name: 'folder-page',
    data () {
      return {
        model: {},
        displayDir: []
      }
    },
    mounted: function () {
      if (!fs.pathExistsSync(projectPath)) {
        fs.mkdirSync(projectPath, 0o777)
      }
      this.refresh_dir()
      console.log(this.$refs)
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        vm.refresh_dir()
      })
    },
    methods: {
      refresh_dir: function () {
        let displayDir = []
        let list = fs.readdirSync(projectPath)
        list.forEach(function (dirName) {
          let stat = fs.statSync(path.join(projectPath, dirName))
          if (stat && stat.isDirectory()) {
            let imgs = fs.statSync(path.join(projectPath, dirName))
            displayDir.push({
              title: dirName,
              id: parseInt(dirName.split('_')[0]),
              name: dirName.split('_')[1],
              sum: imgs.length
            })
          }
        })
        displayDir.sort(function (a, b) {
          return a.id - b.id
        })
        this.displayDir = displayDir
      },
      add_folder: function () {
        this.refresh_dir()
        let n = 0
        for (n = 0; n < this.displayDir.length; n++) {
          if (n !== this.displayDir[n].id) {
            break
          }
        }
        fs.mkdirSync(path.join(projectPath, n + '_name'), 0o777)
        this.refresh_dir()
      },
      open_folder: function (title) {
        shell.showItemInFolder(path.join(projectPath, title))
      },
      rename_folder: function (title) {
        sweetalert2({
          title: 'change name',
          text: 'format must be label_name. ex 0_cat',
          input: 'text',
          inputValue: title,
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'OK',
          showLoaderOnConfirm: true
        }).then((result) => {
          if (result.value) {
            fs.moveSync(path.join(projectPath, title), path.join(projectPath, result.value))
            this.refresh_dir()
          }
        })
      },
      remove_folder: function (title) {
        sweetalert2({
          title: 'Are you sure?',
          text: 'You wont be able to revert this!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            fs.removeSync(path.join(projectPath, title))
            this.refresh_dir()
          }
        })
      },
      add_image: function (event) {
        console.log(event)
        event.preventDefault()
      },
      preventDefault: function (event) {
        event.preventDefault()
      }
    }
  }
</script>

<style scoped>
</style>
