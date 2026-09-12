document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("backend-url");
  const saveBtn = document.getElementById("btn-save");
  const statusEl = document.getElementById("status");

  chrome.storage.local.get(["vigilo_backend_url"], (data) => {
    urlInput.value = data.vigilo_backend_url || "http://localhost:8000";
  });

  saveBtn.addEventListener("click", () => {
    const val = urlInput.value.trim() || "http://localhost:8000";
    chrome.storage.local.set({ vigilo_backend_url: val }, () => {
      statusEl.textContent = "Settings saved successfully!";
      setTimeout(() => {
        statusEl.textContent = "";
      }, 2500);
    });
  });
});
