<template>
  <div id="app">
    <!-- ログイン画面 -->
    <div v-if="!signedIn" class="login">
      <h1>{{ $project }} リリースサイト ログイン</h1>
      <amplify-authenticator
        v-bind:authConfig="authConfig"
      ></amplify-authenticator>
    </div>

    <!-- ログイン後 -->
    <div v-if="signedIn">
      <header class="header">
        <h1>{{ $project }} リリースサイト</h1>

        <div class="logout">
          <amplify-sign-out></amplify-sign-out>
        </div>
      </header>

      <span class="main__container--list-images-error">{{ err }}</span>

      <div class="main">
        <create-image
          :images="images"
          @new-images="updateImages"
        ></create-image>

        <update-stack :images="images"></update-stack>

        <deregister-images
          :images="images"
          @new-images="updateImages"
        ></deregister-images>
      </div>
    </div>
  </div>
</template>

<script>
import { Auth } from "aws-amplify";
import { AmplifyEventBus } from "aws-amplify-vue";
import CreateImage from "./components/CreateImage";
import UpdateStack from "./components/UpdateStack.vue";
import DeregisterImages from "./components/DeregisterImages.vue";

export default {
  name: "app",
  components: {
    CreateImage,
    UpdateStack,
    DeregisterImages
  },
  data() {
    return {
      signedIn: false,
      authConfig: {
        //アカウント作成は非表示
        signInConfig: {
          isSignUpDisplayed: false
        }
      },
      images: [],
      err: ""
    };
  },
  async beforeCreate() {
    document.title = `${this.$project} リリースサイト`;
    AmplifyEventBus.$on("authState", async info => {
      if (info === "signedIn") {
        this.signedIn = true;
        this.images = await this.listImages();
      } else if (info === "signedOut") {
        if (confirm("ログアウトしてもよろしいですか？")) {
          this.signedIn = false;
        }
      }
    });
  },
  created: async function() {
    window.addEventListener("beforeunload", this.confirmSave);
    try {
      //ログイン状態の確認
      await Auth.currentAuthenticatedUser();
      this.signedIn = true;
    } catch (err) {
      //非ログイン状態
      this.signedIn = false;
      return;
    }

    try {
      //AMI一覧を取得
      this.images = await this.listImages();
    } catch (err) {
      this.err = err;
    }
  },
  destroyed() {
    window.removeEventListener("beforeunload", this.confirmSave);
  },
  methods: {
    listImages() {
      return new Promise((resolve, reject) => {
        this.$api
          .get(this.$apiName, "/listimages")
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    updateImages(newImages) {
      this.images = newImages;
    },
    confirmSave(event) {
      event.returnValue = "編集中のものは保存されませんが、よろしいですか？";
    }
  }
};
</script>

<style>
html {
  height: 100%;
}

body {
  height: 100%;
  margin: 0;
  font-family: "メイリオ", "Meiryo", "ＭＳ ゴシック",
    "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", sans-serif;
}

#app {
  text-align: center;
  height: 100%;
}

:root {
  --base-color: #a5272a;
  --bg-color: #faebd7;
}

.login {
  margin-top: 100px;
  display: inline-block;
}

.header {
  text-align: center;
  background-color: var(--base-color);
  padding: 20px 0 20px 0;
  color: #ffffff;
}

.logout {
  position: absolute;
  top: 50px;
  right: 3%;
  height: 53px;
}

.main {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;
  z-index: 0;
}

.main__container--list-images-error {
  margin-top: 10px;
  font-size: 20px;
  color: #ff0000;
  display: inline-block;
}

.main__container {
  margin: 0 50px;
  padding: 0 10px 0px 10px;
  text-align: center;
  width: 100%;
}

.main__container--heading {
  padding: 0 30px;
  width: fit-content;
  margin: 10px auto;
  border-bottom: solid 2px var(--base-color);
}

.main__container--btn {
  display: block;
  text-decoration: none;
  width: 80px;
  height: 30px;
  text-decoration: none;
  color: #000000;
  border: solid 2px var(--base-color);
  border-radius: 3px;
  transition: 0.4s;
  text-align: center;
  vertical-align: middle;
  font-size: 15px;
  background-color: var(--bg-color);
  outline: none;
}

.main__container--btn:hover {
  background: var(--base-color);
  color: white;
  cursor: pointer;
}

.main__container--select {
  width: 170px;
  height: 30px;
  font-size: 15px;
  cursor: pointer;
  background-color: var(--bg-color);
  border-radius: 5px;
  border: var(--base-color) solid 2px;
  outline: none;
}

.main__container--waiting-img {
  width: 24px;
  margin-right: 5px;
  vertical-align: middle;
}
</style>
