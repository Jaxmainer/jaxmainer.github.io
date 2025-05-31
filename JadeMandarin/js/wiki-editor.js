document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const preview = document.getElementById('wiki-preview');
    const editor = document.getElementById('wiki-editor');
    const textarea = document.getElementById('markdown-editor');
    const toolButtons = document.querySelectorAll('.tool-btn');

    // Загрузка сохраненного контента
    const savedContent = localStorage.getItem('wikiContent');
    if (savedContent) {
        textarea.value = savedContent;
        renderMarkdown(savedContent);
    }

    // Обработчики событий
    editBtn.addEventListener('click', toggleEditMode);
    saveBtn.addEventListener('click', saveContent);
    cancelBtn.addEventListener('click', cancelEdit);
    textarea.addEventListener('input', debounce(handleEditorInput, 300));

    // Обработчики для кнопок форматирования
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tag = button.dataset.tag;
            insertMarkdownTag(tag);
        });
    });

    // Функции
    function toggleEditMode() {
        const isEditing = editor.style.display === 'block';
        
        preview.style.display = isEditing ? 'block' : 'none';
        editor.style.display = isEditing ? 'none' : 'block';
        editBtn.style.display = isEditing ? 'block' : 'none';
        saveBtn.style.display = isEditing ? 'none' : 'block';
        cancelBtn.style.display = isEditing ? 'none' : 'block';
        
        if (!isEditing) {
            textarea.focus();
        }
    }

    function saveContent() {
        const content = sanitizeMarkdown(textarea.value);
        localStorage.setItem('wikiContent', content);
        renderMarkdown(content);
        toggleEditMode();
        
        // Здесь можно добавить отправку на сервер
        showNotification('Изменения сохранены!', 'success');
    }

    function cancelEdit() {
        toggleEditMode();
    }

    function handleEditorInput() {
        renderMarkdown(textarea.value);
    }

    function renderMarkdown(content) {
        if (!content) return;
        const html = marked.parse(content);
        preview.innerHTML = html;
        
        // Подсветка синтаксиса
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    function insertMarkdownTag(tag) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selectedText = textarea.value.substring(startPos, endPos);
        
        let newText = '';
        switch(tag) {
            case 'h1': newText = `# ${selectedText}`; break;
            case 'h2': newText = `## ${selectedText}`; break;
            case 'bold': newText = `**${selectedText}**`; break;
            case 'italic': newText = `*${selectedText}*`; break;
            case 'code': newText = `\`\`\`\n${selectedText}\n\`\`\``; break;
            case 'list': newText = `- ${selectedText}`; break;
            default: newText = selectedText;
        }
        
        textarea.value = textarea.value.substring(0, startPos) + newText + textarea.value.substring(endPos);
        textarea.focus();
        textarea.setSelectionRange(
            startPos + newText.length,
            startPos + newText.length
        );
    }

    function sanitizeMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/javascript:/gi, '');
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), timeout);
        };
    }
});