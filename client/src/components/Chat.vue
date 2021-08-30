<template>
  <div class="content">

    <div>

      <!-- Messages list -->
      <div
        class="messages-box"
        ref="messagesBox"
      >

        <div
          class="empty-area"
          v-if="messages.length == 0"
        >
          <a-empty description="Nenhuma mensagem encontrada, inicie uma conversa agora!" />

        </div>

        <a-list
          v-if="messages.length > 0"
          :data-source="messages"
          item-layout="horizontal"
        >
          <a-list-item
            slot="renderItem"
            slot-scope="item"
            class="message"
          >
            <a-comment
              :author="item.author"
              :avatar="item.avatar"
              :content="item.content"
              :datetime="item.datetime"
            />
          </a-list-item>
        </a-list>
      </div>

      <!-- Write area -->
      <a-comment>
        <a-avatar
          slot="avatar"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZsL6PVn0SNiabAKz7js0QknS2ilJam19QQ&usqp=CAU"
          alt="Han Solo"
        />
        <div slot="content">
          <a-form-item>
            <a-textarea
              :rows="4"
              :value="value"
              placeholder="Digite sua mensagem"
              spellcheck="false"
              @change="handleChange"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              html-type="submit"
              :loading="submitting"
              type="primary"
              @click="handleSubmit"
              :disabled="disabledBtn"
            >
              Enviar mensagem
            </a-button>
          </a-form-item>
        </div>
      </a-comment>

    </div>

  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import io from "socket.io-client";

export default {
  data() {
    return {
      username: null,
      socket: io("//73d4-45-166-25-175.ngrok.io"),
      messages: [],
      submitting: false,
      disabledBtn: true,
      value: "",
      moment,
    };
  },

  beforeCreate() {
    this.moment.locale("pt-br");
    this.form = this.$form.createForm(this, { name: "normal_login" });
    if (
      localStorage.getItem("username") == null ||
      localStorage.getItem("username").length == 0
    ) {
      this.$router.push("login");
    }
  },

  created() {
    const _this = this;
    this.username = localStorage.getItem("username");

    axios
      .get("http://73d4-45-166-25-175.ngrok.io/messages")
      .then(function (response) {
        if (response.data.length > 0) {
          _this.messages = response.data.sort((a, b) =>
            a.datetime.localeCompare(b.datetime)
          );
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  updated() {
    this.$nextTick(() => {
      this.scrollConversation();
    });
  },

  mounted() {
    this.socket.on("userMessage", (data) => {
      console.log(data);
      this.messages.push({
        author: data.author,
        avatar: data.avatar,
        content: data.content,
        datetime: moment(data.datetime).fromNow(),
      });
    });
  },

  methods: {
    scrollConversation() {
      this.$nextTick(() => {
        //
        this.$refs.messagesBox.scrollTop =
          this.$el.querySelector(".messages-box").scrollHeight;
      });
    },
    handleSubmit(e) {
      e.preventDefault();
      this.submitting = true;

      setTimeout(() => {
        this.submitting = false;
        this.messages.push({
          author: this.username,
          avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZsL6PVn0SNiabAKz7js0QknS2ilJam19QQ&usqp=CAU",
          content: this.value,
          datetime: moment().fromNow(),
        });

        this.socket.emit("newMessage", {
          author: this.username,
          content: this.value,
          datetime: moment(),
        });

        this.value = "";
        this.disabledBtn = true;
        this.scrollConversation();
      }, 500);
    },

    handleChange(e) {
      this.value = e.target.value;
      if (this.value.length == 0) {
        if (this.disabledBtn == false) this.disabledBtn = true;
      } else {
        if (this.disabledBtn == true) this.disabledBtn = false;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content {
  margin: 0 auto;
  width: 90%;
  max-width: 700px;
}

.content .messages-box {
  height: 400px;
  overflow: auto;
}

.content .message {
  margin: 20px;
  text-align: left !important;
}

.content .empty-area {
  margin: 10%;
}
</style>
