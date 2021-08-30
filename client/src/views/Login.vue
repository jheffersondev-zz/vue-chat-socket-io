<template>
  <div class="content">
    <a-form
      :form="form"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 12 }"
      @submit="handleSubmit"
    >
      <a-form-item label="Nome">
        <a-input
          v-decorator="['name', { rules: [{ required: true, message: 'Digite seu nome!' }] }]"
          placeholder="Digite seu nome"
        />
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
        >
          Entrar
        </a-button>
      </a-form-item>
    </a-form>

  </div>
</template>

<script>
import io from "socket.io-client";
const URL = "//localhost:3000";

export default {
  data() {
    return {
      socket: io(URL),
      formLayout: "horizontal",
      form: this.$form.createForm(this, { name: "coordinated" }),
      name: null,
    };
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          localStorage.setItem("username", values.name);
          this.socket.emit("newUserRegistered", values.name);
          this.$router.push({ path: "/chat" });
        }
      });
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
</style>