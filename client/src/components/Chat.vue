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
          item-layout="vertical"
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
            >
            </a-comment>

          </a-list-item>

        </a-list>
      </div>
      <a-tag v-if="someoneTyping.username">{{someoneTyping.username}} digitando..</a-tag>
      <!-- Write area -->
      <a-comment>
        <div slot="content">
          <a-form-item>
            <a-textarea
              :rows="4"
              :value="value"
              placeholder="Digite sua mensagem"
              spellcheck="false"
              @change="handleChange"
              @keyup="EventOnTypingMessage"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              html-type="submit"
              :loading="submitting"
              ref="submitBtn"
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

const URL = "//localhost:3000";

export default {
  data() {
    return {
      username: null,
      socket: io(URL),
      messages: [],
      submitting: false,
      disabledBtn: true,
      value: "",
      someoneTyping: {
        username: null,
        lastUpdate: null,
      },
      moment,
    };
  },

  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },

  created() {
    const _this = this;
    this.username = localStorage.getItem("username");

    axios
      .get(`${URL}/messages`)
      .then(function (response) {
        if (response.data.length > 0) {
          _this.messages = response.data.sort((a, b) =>
            a.datetime.localeCompare(b.datetime)
          );

          _this.messages.map((msg) => {
            if (moment(msg.datetime).isSame(moment(), "day")) {
              //today
              msg.datetime = moment(msg.datetime).format("HH:mm");
            } else if (
              moment(msg.datetime).isSame(moment().subtract(1, "day"), "day")
            ) {
              // yesterday
              msg.datetime = `Ontem - ${moment(msg.datetime).format("HH:mm")}`;
            } else {
              //some days ago
              msg.datetime = moment(msg.datetime).format("DD/MM/YYYY");
            }
          });
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
      this.messages.push({
        author: data.author,
        avatar: data.avatar,
        content: data.content,
        datetime: moment(data.datetime).format("HH:mm"),
      });
    });

    this.socket.on("newUserJoinedToChat", (username) => {
      this.$message.success(`${username} entrou na conversa`);
    });

    // verify if someone is typing
    setInterval(() => {
      if (this.someoneTyping.username != null) {
        if (parseInt(Date.now() - this.someoneTyping.lastUpdate) > 2000) {
          this.someoneTyping.username = null;
          this.someoneTyping.lastUpdate = null;
        }
      }
    }, 100);

    this.socket.on("userTyping", (username) => {
      this.someoneTyping.username = username;
      this.someoneTyping.lastUpdate = Date.now();

      console.log(`${username} ta digitando`);
    });
  },

  methods: {
    scrollConversation() {
      this.$nextTick(() => {
        this.$refs.messagesBox.scrollTop =
          this.$el.querySelector(".messages-box").scrollHeight;
      });
    },

    EventOnTypingMessage(e) {
      let value = e.target.value;

      if (e.keyCode === 13) {
        if (value.trim().length > 0) {
          this.$refs.submitBtn.$el.click();
        }
      }
    },

    handleSubmit(e) {
      e.preventDefault();
      this.submitting = true;

      this.submitting = false;
      this.messages.push({
        author: this.username,
        avatar:
          "https://i.pinimg.com/originals/35/79/3b/35793b67607923a68d813a72185284fe.jpg",
        content: this.value,
        datetime: moment().format("HH:mm"),
      });

      this.socket.emit("newMessage", {
        author: this.username,
        content: this.value,
        datetime: moment(),
      });

      this.value = "";
      this.disabledBtn = true;
      this.scrollConversation();
    },

    handleChange(e) {
      this.value = e.target.value;
      this.socket.emit("typing", this.username);

      if (this.value.length == 0) {
        if (this.disabledBtn == false) this.disabledBtn = true;
      } else {
        if (this.disabledBtn == true) this.disabledBtn = false;
      }
    },
  },
};
</script>

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

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #c3c3c3;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #999999;
}

.content .message {
  margin: 20px;
  text-align: left !important;
}

.content .empty-area {
  margin: 10%;
}
</style>
