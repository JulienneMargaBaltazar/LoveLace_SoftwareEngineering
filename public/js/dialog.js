(function () {
    const style = document.createElement('style');
    style.textContent = `
        dialog.erp-dialog {
            border: 1px solid #CBD5E1;
            border-radius: 16px;
            padding: 0;
            max-width: 420px;
            width: calc(100% - 2rem);
            background: #FFFFFF;
            color: #1E293B;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.22);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            animation: erpDialogPop 0.16s ease-out;
        }
        dialog.erp-dialog::backdrop {
            background: rgba(15, 23, 42, 0.55);
            backdrop-filter: blur(2px);
        }
        @keyframes erpDialogPop {
            from { opacity: 0; transform: scale(0.96) translateY(6px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .erp-dialog-body { padding: 1.5rem 1.5rem 1.25rem; }
        .erp-dialog-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem; }
        .erp-dialog-icon {
            width: 38px; height: 38px; border-radius: 10px;
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 1.15rem; flex-shrink: 0;
        }
        .erp-dialog-icon.danger { background: #FEE2E2; color: #DC2626; }
        .erp-dialog-icon.info   { background: #EDE9FE; color: #4F46E5; }
        .erp-dialog-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #292966; }
        .erp-dialog-msg { margin: 0; font-size: 0.88rem; line-height: 1.5; color: #475569; }
        .erp-dialog-footer {
            display: flex; justify-content: flex-end; gap: 0.6rem;
            padding: 0.9rem 1.5rem; background: #F8FAFC;
            border-top: 1px solid #E2E8F0; border-radius: 0 0 16px 16px;
        }
        .erp-btn {
            width: auto !important; padding: 0.5rem 1.05rem; border-radius: 8px;
            font-size: 0.84rem; font-weight: 600; cursor: pointer;
            border: 1px solid transparent; transition: all 0.15s ease;
        }
        .erp-btn-cancel { background: #FFFFFF; color: #475569; border-color: #CBD5E1; }
        .erp-btn-cancel:hover { background: #F1F5F9; }
        .erp-btn-primary { background: #292966; color: #FFFFFF; }
        .erp-btn-primary:hover { background: #1E1E4B; }
        .erp-btn-danger { background: #DC2626; color: #FFFFFF; }
        .erp-btn-danger:hover { background: #B91C1C; }
    `;
    document.head.appendChild(style);

    function openDialog({ title, message, confirmText = 'OK', cancelText = null, variant = 'info' }) {
        return new Promise((resolve) => {
            const dialog = document.createElement('dialog');
            dialog.className = 'erp-dialog';
            const iconSymbol = variant === 'danger' ? '⚠️' : 'ℹ️';
            const confirmBtnClass = variant === 'danger' ? 'erp-btn-danger' : 'erp-btn-primary';

            dialog.innerHTML = `
                <div class="erp-dialog-body">
                    <div class="erp-dialog-header">
                        <div class="erp-dialog-icon ${variant}">${iconSymbol}</div>
                        <h3 class="erp-dialog-title">${title}</h3>
                    </div>
                    <p class="erp-dialog-msg">${message}</p>
                </div>
                <div class="erp-dialog-footer">
                    ${cancelText ? `<button type="button" class="erp-btn erp-btn-cancel" data-action="cancel">${cancelText}</button>` : ''}
                    <button type="button" class="erp-btn ${confirmBtnClass}" data-action="confirm">${confirmText}</button>
                </div>
            `;

            const cleanup = (result) => {
                dialog.close();
                dialog.remove();
                resolve(result);
            };

            dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => cleanup(true));
            const cancelBtn = dialog.querySelector('[data-action="cancel"]');
            if (cancelBtn) cancelBtn.addEventListener('click', () => cleanup(false));
            dialog.addEventListener('cancel', (e) => { e.preventDefault(); cleanup(false); });

            document.body.appendChild(dialog);
            dialog.showModal();
        });
    }

    window.showConfirm = (message, options = {}) => openDialog({
        title: options.title || 'Confirm Action',
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'danger'
    });

    window.showAlert = (message, options = {}) => openDialog({
        title: options.title || 'Notice',
        message,
        confirmText: options.confirmText || 'OK',
        cancelText: null,
        variant: options.variant || 'info'
    });
})();
