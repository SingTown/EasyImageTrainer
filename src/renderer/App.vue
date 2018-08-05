<template>
  <div class="layout" id="app">
    <Layout :style="{minHeight: '100vh'}">
      <Sider collapsible :collapsed-width="78">
        <Menu v-bind:active-name="path" theme="dark" width="auto">
          <MenuItem name="/Example" :to="{ name: 'example-page'}">
            <Icon type="ios-navigate"></Icon>
            <span>Example</span>
          </MenuItem>
          <MenuItem name="/Folder" :to="{ name: 'folder-page'}">
              <Icon type="ios-navigate"></Icon>
              <span>Folder</span>
          </MenuItem>
          <MenuItem name="/Train" :to="{ name: 'train-page'}">
              <Icon type="ios-navigate"></Icon>
              <span>Train</span>
          </MenuItem>
          <MenuItem name="/Save" :to="{ name: 'save-page'}">
            <Icon type="ios-navigate"></Icon>
            <span>Save</span>
          </MenuItem>
        </Menu>
      </Sider>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </Layout>
  </div>
</template>

<script>
  export default {
    name: 'ai-trainer',
    data () {
      return {
        path: '/Example'
      }
    },
    watch: {
      '$route' (to, from) {
        this.path = to.path
      }
    },
    mounted: function () {
      this.$router.push({'path': '/Example'})
    },
    methods: {
    }
  }
</script>

<style scoped>
  .layout-con{
    height: 100%;
    width: 100%;
  }
  .menu-item span{
    display: inline-block;
    overflow: hidden;
    width: 69px;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: width .2s ease .2s;
  }
  .menu-item i{
    transform: translateX(0px);
    transition: font-size .2s ease, transform .2s ease;
    vertical-align: middle;
    font-size: 16px;
  }
  .collapsed-menu span{
    width: 0px;
    transition: width .2s ease;
  }
  .collapsed-menu i{
    transform: translateX(5px);
    transition: font-size .2s ease .2s, transform .2s ease .2s;
    vertical-align: middle;
    font-size: 22px;
  }
</style>

