const app = document.getElementById("app");

export const router = {
  navigate(sceneFn) {
    app.innerHTML = "";
    app.appendChild(sceneFn());
  }
};
