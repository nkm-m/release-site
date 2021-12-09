import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";
import Amplify, * as AmplifyModules from "aws-amplify";
import { AmplifyPlugin } from "aws-amplify-vue";
import aws_exports from "./aws-exports";
import { API } from "aws-amplify";
Amplify.configure(aws_exports);
Vue.prototype.$project = "<Project Name>";
//API GatewayのAPI名
Vue.prototype.$apiName = "<API Name>";
Vue.prototype.$api = API;
//ログイン関連の日本語化
const messageResource = {
  ja: {
    Username: "ユーザー名",
    "Enter your Username": "ユーザ名を入力",
    "Sign In": "ログイン",
    Password: "パスワード",
    "Enter your password": "パスワードを入力",
    "Forgot your password? ": "パスワードを忘れた場合",
    "Reset password": "パスワードリセット",
    "Back to Sign In": "ログインに戻る",
    "Sign in to your account": "ログイン",
    "Sign Out": "ログアウト",
    "Reset your password": "パスワードをリセット",
    "Send Code": "送信"
  }
};
AmplifyModules.I18n.putVocabularies(messageResource);
Vue.prototype.$notifySlack = async function(text, icon_emoji) {
  const payload = {
    username: `${this.$project} ReleaseSite Notification`,
    text,
    icon_emoji
  };
  await this.axios.post(
    "Slack Incoming WebHook URL",
    JSON.stringify(payload)
  );
};
Vue.prototype.$disableButton = function(target) {
  for (let i = 0; i < target.length; i++) {
    const btn = document.getElementById(target[i]);
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
  }
};
Vue.prototype.$enableButton = function(target) {
  for (let i = 0; i < target.length; i++) {
    const btn = document.getElementById(target[i]);
    btn.disabled = false;
    btn.style.cursor = "pointer";
  }
};
Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(AmplifyPlugin, AmplifyModules);
new Vue({
  render: h => h(App)
}).$mount("#app");
