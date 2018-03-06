import Vue from 'vue';
import Axios from 'axios';
import App from './App.vue';

Vue.prototype.$http = Axios;

new Vue({
  el: '#app',
  render: h => h(App)
});
