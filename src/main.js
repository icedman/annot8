import Vue from 'vue';
import Axios from 'axios';
import App from './App.vue';

Vue.prototype.$http = Axios;
Vue.prototype.$store = { state: {} };
Vue.prototype.$config = {
  selector: 'article',
  debug: true,
  svg: true,
  mobile: false
};

if (typeof(window.annot8Config) == 'object') {
  Vue.prototype.$config = Object.assign(Vue.prototype.$config, window.annot8Config);
}

try {
    var navigator = window.navigator;
    Vue.prototype.$config.mobile = ( navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
    );
    // Vue.prototype.$config.mobile = true;
} catch(e) {
}

new Vue({
  el: '#annot8-app',
  render: h => h(App)
});
