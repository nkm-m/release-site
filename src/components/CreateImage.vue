<template>
  <div class="main__container">
    <modal
      :confirmationMessage="confirmationMessage"
      :target="imageName"
      :method-name="methodName"
      v-show="modal"
      @execute-method="executeMethod"
    ></modal>

    <h3 class="main__container--heading">AMI作成</h3>

    <!-- AMI一覧表示 -->
    <div class="main__container--display-images">
      <p class="main__container--list-images">AMI一覧</p>
      <p v-for="(image, i) in images" :key="i">
        {{ image.imageName }}
      </p>
    </div>

    <!-- バージョン番号入力 -->
    <p class="main__container--version-no">バージョン番号</p>
    <input
      type="text"
      class="main__container--input-version"
      v-model="version"
      placeholder="例：1.0.0"
    />

    <!-- 作成・確認ボタン -->
    <div class="main__container--create-images-btn-area">
      <button
        type="button"
        class="main__container--btn main__container-create-images-btn"
        id="create-image-btn"
        @click="
          showModal('下記のAMIを作成してもよろしいですか？'),
            (methodName = 'createImage')
        "
      >
        作成
      </button>

      <button
        type="button"
        class="main__container--btn main__container-create-images-btn"
        id="check-image-state-btn"
        @click="checkImageStateOnClick()"
      >
        確認
      </button>
    </div>

    <!-- 作成状況表示 -->
    <div>
      <span v-if="state === 'pending'">
        <img src="../assets/waiting.gif" class="main__container--waiting-img" />
      </span>
      <span
        :style="{ color }"
        class="main__container-creation-images-message"
        >{{ creationMessage }}</span
      >
    </div>
  </div>
</template>

<script>
import Modal from "./Modal";
export default {
  name: "CreateImage",
  components: {
    Modal
  },
  data() {
    return {
      version: "",
      imageName: "",
      imageId: "",
      state: "",
      methodName: "",
      creationMessage: "",
      confirmationMessage: "",
      color: "",
      modal: false
    };
  },
  props: ["images"],
  methods: {
    /**
     * 入力チェックを行い、モーダルを表示するメソッド
     */
    showModal(message) {
      this.creationMessage = "";
      if (this.version === "") {
        this.changeState("error", "バージョンが未入力です。", "#ff0000");
        return;
      }
      if (!this.version.match(/^[0-9a-z\\.]+$/)) {
        this.changeState(
          "error",
          "半角英数字とドットで入力してください。",
          "#ff0000"
        );
        return;
      }
      this.imageName = `${this.$project}-${this.version}`;
      for (let i = 0; i < this.images.length; i++) {
        if (this.imageName === this.images[i].imageName) {
          this.changeState("error", "存在するバージョンです。", "#ff0000");
          return;
        }
      }
      this.confirmationMessage = message;
      this.modal = true;
    },
    /**
     * モーダルでの選択が「はい」だった場合に、対象メソッドを実行するメソッド
     */
    async executeMethod(yes, executeMethod) {
      this.modal = false;
      if (yes) {
        if (executeMethod === "createImage") {
          await this.createImage();
        }
      }
    },
    /**
     * AMIを作成するメソッド
     * 作成後は作成状況も監視し、完了したらSlackに通知する
     */
    async createImage() {
      this.$disableButton(["create-image-btn", "check-image-state-btn"]);
      this.changeState("pending", "AMI作成中", "#0064c8");

      try {
        const image = await this.requestToCreateImages();
        this.imageId = image.imageId;
        const isCompleted = await this.checkImageState();
        if (!isCompleted) {
          this.changeState(
            "error",
            "AMI作成中にエラーが発生しました。EC2コンソールでのAMIの確認を行ってください。",
            "#ff0000"
          );
        } else {
          //AMI情報を更新
          this.images.push({
            imageName: this.imageName,
            imageId: this.imageId,
            creationTime: new Date(image.CreationDate).getTime(),
            disable: true
          });
          this.$emit("new-images", this.images);
          this.changeState("complete", "AMIの作成が完了しました。", "#00c800");
          this.$notifySlack(
            `${this.$project}のAMIの作成が完了しました。`,
            "aws_icon_ec2"
          );
        }
        this.$enableButton(["create-image-btn", "check-image-state-btn"]);
      } catch (err) {
        console.log(err);
        this.changeState(
          "error",
          `AMI作成中にエラーが発生しました。EC2コンソールでのAMIの確認を行ってください。${err}`,
          "#ff0000"
        );
      }
      this.$enableButton(["create-image-btn", "check-image-state-btn"]);
    },
    /**
     * AMIの作成状況を監視するメソッド
     * 30秒ごとに状態を取得し、availableなら作成完了、pendingは待機、それ以外はエラー
     */
    async checkImageState() {
      try {
        let state = await this.requestToGetImageState();
        if (state === "available") {
          return true;
        }
        while (state !== "available") {
          this.changeState("pending", "AMI作成中", "#0064c8");
          await new Promise(resolve => setTimeout(resolve, 30000));
          state = await this.requestToGetImageState();
          if (state === "available") {
            return true;
          } else if (state !== "pending") {
            return false;
          }
        }
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    /**
     * 確認ボタンクリック時にAMIの状態を確認するメソッド
     * リロードを考慮し、作成時刻が最新のAMI IDでリクエストする
     */
    async checkImageStateOnClick() {
      this.changeState("pending", "確認中", "#0064c8");
      this.$disableButton(["create-image-btn", "check-image-state-btn"]);

      //リロード後のAMI ID再設定
      if (this.imageId === "") {
        this.imageId = this.images[this.images.length - 1].imageId;
      }

      try {
        const isCompleted = await this.checkImageState();
        if (!isCompleted) {
          this.changeState(
            "error",
            "AMI作成中にエラーが発生しました。EC2コンソールでのAMIの確認を行ってください。",
            "#ff0000"
          );
          this.$enableButton(["create-image-btn", "check-image-state-btn"]);
          return;
        }
        this.changeState("complete", "AMIの作成が完了しました。", "#00c800");
        this.$notifySlack(
          `${this.$project}のAMIの作成が完了しました。`,
          "aws_icon_ec2"
        );
      } catch (err) {
        console.log(err);
        this.changeState(
          "error",
          `AMI作成中にエラーが発生しました。EC2コンソールでのAMIの確認を行ってください。${err}`,
          "#ff0000"
        );
      }
      this.$enableButton(["create-image-btn", "check-image-state-btn"]);
    },
    requestToCreateImages() {
      return new Promise((resolve, reject) => {
        this.$api
          .post(this.$apiName, "/createimage", {
            body: this.imageName
          })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    requestToGetImageState() {
      return new Promise((resolve, reject) => {
        this.$api
          .get(this.$apiName, "/getimagestate", {
            queryStringParameters: {
              imageId: this.imageId
            }
          })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    /**
     * AMI作成状況と表示メッセージ、フォントカラーを変更するメソッド
     */
    changeState(state, message, color) {
      this.state = state;
      this.creationMessage = message;
      this.color = color;
    }
  }
};
</script>

<style scoped>
.main__container--display-images {
  border: 2px solid var(--base-color);
  background-color: var(--bg-color);
  padding: 3px 20px;
  width: fit-content;
  margin: 35px auto;
  border-radius: 10px;
}

.main__container--list-images {
  margin: 5px 0;
}

.main__container--version-no {
  margin-top: 40px;
}

.main__container--input-version {
  font-size: 15px;
  text-align: center;
  box-sizing: border-box;
  width: 100px;
  height: 40px;
  transition: 0.3s;
  border: 1px solid #1b2538;
  border-radius: 4px;
}

.main__container--input-version::placeholder {
  text-align: center;
}

.main__container--input-version:focus {
  border: 1px solid var(--base-color);
  outline: none;
  box-shadow: 0 0 5px 1px var(--base-color);
}

.main__container--create-images-btn-area {
  margin: 30px auto;
}

.main__container-create-images-btn {
  display: inline-block;
  margin: 0px 15px;
}

.main__container-creation-images-message {
  font-weight: bold;
}
</style>
