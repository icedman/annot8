import Vue from 'vue';
import Axios from 'axios';
import App from './App.vue';
import VueMq from 'vue-mq'

Vue.prototype.$http = Axios;
Vue.prototype.$config = {
  selector: 'article',
  debug: true,
  svg: true
};

Vue.use(VueMq, {
  breakpoints: {
    mobile: 450,
    tablet: 900,
    laptop: 1250,
    desktop: Infinity,
  }
});

if (typeof(window.annot8Config) == 'object') {
  Vue.prototype.$config = Object.assign(Vue.prototype.$config, window.annot8Config);
}

new Vue({
  el: '#annot8-app',
  render: h => h(App)
});
