(() => {
    if (window.AppDialog) return;

    const style = document.createElement("style");
    style.textContent = `
        .app-dialog-backdrop {
            position: fixed; inset: 0; background: rgba(15, 23, 42, 0.48);
            backdrop-filter: blur(2px); display: flex; align-items: center;
            justify-content: center; z-index: 99999; opacity: 0;
            transition: opacity 0.16s ease; font-family: 'Inter', system-ui, sans-serif;
        }
        .app-dialog-backdrop.open { opacity: 1; }
        .app-dialog-box {
            background: #ffffff; color: #1e293b; width: 92%; max-width: 420px;
            border-radius: 14px; padding: 22px 24px;
            box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.18);
            border: 1px solid #e2e8f0; transform: translateY(8px) scale(0.98);
            transition: transform 0.16s ease;
        }
        .app-dialog-backdrop.open .app-dialog-box { transform: translateY(0) scale(1); }
        .app-dialog-title { font-size: 16px; font-weight: 700; color: #1e1b4b; margin: 0 0 8px; }
        .app-dialog-msg { font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 16px; white-space: pre-line; }
        .app-dialog-input {
            width: 100%; box-sizing: border-box; padding: 9px 12px; font-size: 14px;
            border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px; outline: none;
        }
        .app-dialog-input:focus { border-color: #312e81; box-shadow: 0 0 0 3px rgba(49, 46, 129, 0.12); }
        #appDialogBackdrop .app-dialog-actions {
            display: flex !important; justify-content: flex-end !important;
            align-items: center !important; gap: 10px !important; margin-top: 4px !important;
        }
        #appDialogBackdrop .app-dialog-btn {
            display: inline-flex !important; align-items: center !important; justify-content: center !important;
            width: 104px !important; min-width: 104px !important; height: 38px !important;
            padding: 0 16px !important; margin: 0 !important; border-radius: 8px !important;
            font-family: inherit !important; font-size: 13px !important; font-weight: 600 !important;
            line-height: 1 !important; cursor: pointer !important; box-sizing: border-box !important;
            text-align: center !important; transition: all 0.15s ease !important;
        }
        #appDialogBackdrop .app-dialog-btn-cancel {
            background: #ffffff !important; color: #334155 !important;
            border: 1.5px solid #cbd5e1 !important;
        }
        #appDialogBackdrop .app-dialog-btn-cancel:hover {
            background: #f1f5f9 !important; border-color: #94a3b8 !important; color: #0f172a !important;
        }
        #appDialogBackdrop .app-dialog-btn-primary {
            background: #262262 !important; color: #ffffff !important; border: 1.5px solid #262262 !important;
        }
        #appDialogBackdrop .app-dialog-btn-primary:hover { background: #1e1b4b !important; }
        #appDialogBackdrop .app-dialog-btn-danger {
            background: #dc2626 !important; color: #ffffff !important; border: 1.5px solid #dc2626 !important;
        }
        #appDialogBackdrop .app-dialog-btn-danger:hover { background: #b91c1c !important; }
    `;
    document.head.appendChild(style);

    function openDialog({ title = "Notice", message = "", mode = "alert", defaultValue = "", confirmText = "OK", cancelText = "Cancel", danger = false }) {
        return new Promise((resolve) => {
            const backdrop = document.createElement("div");
            backdrop.id = "appDialogBackdrop"; backdrop.className = "app-dialog-backdrop";
            backdrop.innerHTML = `
                <div class="app-dialog-box" role="dialog" aria-modal="true">
                    <h3 class="app-dialog-title"></h3>
                    <p class="app-dialog-msg"></p>
                    ${mode === "prompt" ? '<input class="app-dialog-input" type="text" />' : ""}
                    <div class="app-dialog-actions">
                        ${mode !== "alert" ? `<button type="button" class="app-dialog-btn app-dialog-btn-cancel">${cancelText}</button>` : ""}
                        <button type="button" class="app-dialog-btn ${danger ? "app-dialog-btn-danger" : "app-dialog-btn-primary"}">${confirmText}</button>
                    </div>
                </div>
            `;

            backdrop.querySelector(".app-dialog-title").textContent = title;
            backdrop.querySelector(".app-dialog-msg").textContent = message;

            const input = backdrop.querySelector(".app-dialog-input");
            if (input) input.value = defaultValue;

            const close = (result) => {
                backdrop.classList.remove("open");
                document.removeEventListener("keydown", onKey);
                setTimeout(() => backdrop.remove(), 160);
                resolve(result);
            };

            const onKey = (e) => {
                if (e.key === "Escape") close(mode === "confirm" ? false : null);
                if (e.key === "Enter" && document.activeElement === input) close(input.value);
            };

            const cancelBtn = backdrop.querySelector(".app-dialog-btn-cancel");
            if (cancelBtn) cancelBtn.addEventListener("click", () => close(mode === "confirm" ? false : null));

            const okBtn = backdrop.querySelector(".app-dialog-btn-primary, .app-dialog-btn-danger");
            okBtn.addEventListener("click", () => {
                if (mode === "confirm") close(true);
                else if (mode === "prompt") close(input ? input.value : "");
                else close(true);
            });

            backdrop.addEventListener("click", (e) => {
                if (e.target === backdrop && mode !== "alert") close(mode === "confirm" ? false : null);
            });

            document.addEventListener("keydown", onKey);
            document.body.appendChild(backdrop);
            requestAnimationFrame(() => backdrop.classList.add("open"));
            if (input) { input.focus(); input.select(); } else { okBtn.focus(); }
        });
    }

    window.AppDialog = {
        alert: (message, title = "Notice") => openDialog({ title, message, mode: "alert", confirmText: "OK" }),
        confirm: (message, options = {}) => openDialog({
            title: options.title || "Confirm Action",
            message,
            mode: "confirm",
            confirmText: options.confirmText || "Confirm",
            cancelText: options.cancelText || "Cancel",
            danger: Boolean(options.danger)
        }),
        prompt: (message, defaultValue = "", title = "Input Required") => openDialog({
            title,
            message,
            mode: "prompt",
            defaultValue,
            confirmText: "Submit",
            cancelText: "Cancel"
        })
    };
})();
