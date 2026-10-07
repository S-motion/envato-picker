// ==UserScript==
// @name         Envato Elements Footage Picker
// @name:ru      Envato Elements — подборка футажей
// @namespace    https://elements.envato.com/
// @description  Collect Envato Elements footage, organize folders and download through Filesta
// @description:ru Отмечайте футажи на Envato Elements, создавайте папки и скачивайте через Filesta
// @version      1.0.78
// @homepageURL  https://github.com/S-motion/envato-picker
// @updateURL    https://raw.githubusercontent.com/S-motion/envato-picker/main/Envato-Elements-Footage-Picker.user.js
// @downloadURL  https://raw.githubusercontent.com/S-motion/envato-picker/main/Envato-Elements-Footage-Picker.user.js
// @match        https://elements.envato.com/*
// @match        https://*.elements.envato.com/*
// @match        https://filesta.com/services/envato/content*
// @icon         https://elements.envato.com/favicon.svg
// @run-at       document-idle
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_download
// @grant        unsafeWindow
// @connect      elements.envatousercontent.com
// @grant        window.onurlchange
// ==/UserScript==

(async () => {
    'use strict';

    // Keep interface translations together; footage titles remain unchanged.
    const TRANSLATIONS = Object.freeze({ ru: Object.freeze({
        picked: 'Подборка футажей',
        empty: 'Пока ничего не выбрано',
        noPreview: 'Нет превью',
        showList: 'Показать список',
        showThumbnails: 'Показать миниатюры',
        copy: 'Скопировать ссылки',
        copied: 'Ссылки скопированы',
        clear: 'Очистить подборку',
        confirmClear: 'Удалить все футажи из подборки?',
        openFilesta: 'Открыть Filesta',
        downloadFilesta: 'Скачать через Filesta',
        add: 'Добавить в подборку',
        remove: 'Убрать из подборки',
        toggle: 'Открыть или закрыть подборку',
        download: 'Скачать через Filesta',
        downloadAll: 'Скачать подборку',
        queue: 'Загрузки Filesta',
        queued: 'В очереди',
        preparing: 'Подготовка в Filesta',
        downloading: 'Скачивание',
        done: 'Скачано',
        failed: 'Ошибка',
        cancelled: 'Отменено',
        review: 'Проверьте результат в Filesta',
        stop: 'Остановить после текущего',
        resume: 'Продолжить оставшиеся',
        workerLink: 'Открыть служебную вкладку',
        queueHelp: 'Filesta обрабатывает файлы в фоновой вкладке. При необходимости входа или проверки откройте её. Не закрывайте вкладку до завершения.',
        needsManager: 'Для фонового скачивания обновите скрипт в Tampermonkey.',
        busy: 'Дождитесь текущей очереди или остановите её.',
        cancelRemaining: 'Отменить оставшиеся',
        noWorker: 'Служебная вкладка не отвечает. Откройте её и проверьте вход в Filesta.',
        workerForm: 'Не найдена доступная форма Filesta. Проверьте вход, язык интерфейса (русский или английский) и сообщения сервиса.',
        workerTimeout: 'Filesta не выдала ссылку. Проверьте результат в служебной вкладке перед повторной попыткой.',
        downloadError: 'Скачивание не завершено. Проверьте разрешение загрузок и допустимые расширения файлов в Tampermonkey.',
        storageError: 'Не удалось сохранить состояние загрузок.',
        emptyQueue: 'Файлы ещё не добавлены в очередь',
        blocked: 'Требуется внимание',
        allFolders: 'Все футажи', noFolder: 'Без группы', folder: 'Группа',
        newFolder: 'Создать группу из выбранных', folderName: 'Название группы', emptyGroup: 'В группе пока нет футажей',
        create: 'Создать', cancel: 'Отмена', move: 'Перенести в…',
        select: 'Выбрать для групповых действий', selectAll: 'Выбрать все футажи',
        selected: 'Выбрано', search: 'Поиск по названию или ссылке',
        sort: 'Порядок футажей', added: 'По добавлению', az: 'По названию А–Я', za: 'По названию Я–А',
        exportHTML: 'Экспорт HTML', exportJSON: 'Резервная копия JSON', importJSON: 'Импорт JSON',
        importError: 'Не удалось прочитать резервную копию. Нужен JSON Envato Picker версии 1 размером до 10 МБ.',
        imported: 'Подборка импортирована', undo: 'Отменить изменение', changed: 'Подборка изменена',
        removeSelected: 'Удалить выбранные', downloadSelected: 'Скачать выбранные', downloadVisible: 'Скачать всю подборку',
        nothingFound: 'Ничего не найдено', saveError: 'Не удалось сохранить подборку. Повторите изменение.',
        previewHint: 'Наведите курсор для просмотра видео',
        more: 'Дополнительные действия', shortTitle: 'Подборка', searchShort: 'Найти футаж…',
        hideDownloads: 'Скрыть очередь загрузок',
        fullscreen: 'Развернуть на весь экран', exitFullscreen: 'Вернуться к компактному окну',
        exportHelp: 'Нажмите на карточку, чтобы открыть оригинал. Миниатюры загружаются из интернета.',
    }), en: Object.freeze({
        picked: 'Footage collection', empty: 'Nothing selected yet', noPreview: 'No preview',
        showList: 'Show list', showThumbnails: 'Show thumbnails', copy: 'Copy links', copied: 'Links copied',
        clear: 'Clear collection', confirmClear: 'Remove all footage from the collection?',
        openFilesta: 'Open Filesta', downloadFilesta: 'Download via Filesta',
        add: 'Add to collection', remove: 'Remove from collection', toggle: 'Open or close collection',
        download: 'Download via Filesta', downloadAll: 'Download collection', queue: 'Filesta downloads',
        queued: 'Queued', preparing: 'Preparing in Filesta', downloading: 'Downloading', done: 'Downloaded',
        failed: 'Error', cancelled: 'Cancelled', review: 'Check the result in Filesta',
        stop: 'Stop after current file', resume: 'Resume remaining files', workerLink: 'Open background tab',
        queueHelp: 'Filesta processes files in a background tab. Open it if sign-in or verification is required. Keep the tab open until processing finishes.',
        needsManager: 'Update the script in Tampermonkey to enable background downloads.',
        busy: 'Wait for the current queue or stop it.', cancelRemaining: 'Cancel remaining files',
        noWorker: 'The background tab is not responding. Open it and check your Filesta sign-in.',
        workerForm: 'No available Filesta form found. Check your sign-in, interface language (Russian or English) and service messages.',
        workerTimeout: 'Filesta did not provide a link. Check the result in the background tab before trying again.',
        downloadError: 'Download did not finish. Check download permissions and allowed file extensions in Tampermonkey.',
        storageError: 'Could not save download progress.', emptyQueue: 'No files queued yet', blocked: 'Needs attention',
        allFolders: 'All footage', noFolder: 'No group', folder: 'Group',
        newFolder: 'Create group from selection', folderName: 'Group name', emptyGroup: 'No footage in this group yet', create: 'Create', cancel: 'Cancel', move: 'Move to…',
        select: 'Select for group actions', selectAll: 'Select all footage', selected: 'Selected', search: 'Search by title or link',
        sort: 'Footage order', added: 'Date added', az: 'Title A–Z', za: 'Title Z–A',
        exportHTML: 'Export HTML', exportJSON: 'JSON backup', importJSON: 'Import JSON',
        importError: 'Could not read the backup. Use an Envato Picker version 1 JSON file up to 10 MB.',
        imported: 'Collection imported', undo: 'Undo change', changed: 'Collection changed',
        removeSelected: 'Remove selected', downloadSelected: 'Download selected', downloadVisible: 'Download collection',
        nothingFound: 'Nothing found', saveError: 'Could not save the collection. Try the change again.',
        previewHint: 'Hover to preview video', more: 'More actions', shortTitle: 'Collection', searchShort: 'Find footage…',
        hideDownloads: 'Hide download queue', fullscreen: 'Expand to full screen', exitFullscreen: 'Return to compact window',
        exportHelp: 'Click a card to open the original. Thumbnails load from the internet.',
    }) });
    function browserLocale(preferences = [], fallback = '') {
        const primary = preferences.find(tag => typeof tag === 'string' && tag.trim()) || fallback;
        return /^ru(?:-|$)/i.test(String(primary).trim()) ? 'ru' : 'en';
    }
    const UI_LANG = browserLocale(navigator.languages || [], navigator.language);
    const UI = TRANSLATIONS[UI_LANG];

    const WEB_JOB_PREFIX = 'envato_picker_filesta_web_';
    const WEB_WORKER_URL = 'https://filesta.com/services/envato/content';
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    // WEB_HELPERS_START: pure helpers also exercised by node tests.
    function normalizeDownloadEntries(entries) {
        const unique = new Map();
        for (const [input, title] of entries) {
            try {
                const url = new URL(input);
                if (url.protocol !== 'https:' || url.username || url.password ||
                    !(url.hostname === 'elements.envato.com' || url.hostname.endsWith('.elements.envato.com')) || url.pathname === '/') continue;
                url.hash = ''; url.search = ''; url.pathname = url.pathname.replace(/\/+$/, '');
                unique.set(url.href, String(title || url.pathname.split('/').pop()));
            } catch { /* Ignore malformed input. */ }
        }
        return [...unique].map(([url, title]) => ({ url, title, status: 'queued', error: '' }));
    }

    function isFilestaVideoLink(href) {
        try {
            const url = new URL(href);
            return url.protocol === 'https:' && !url.username && !url.password &&
                (url.hostname === 'elements.envatousercontent.com' || url.hostname.endsWith('.elements.envatousercontent.com'));
        } catch { return false; }
    }

    function filestaFilename(href, title) {
        const url = new URL(href);
        const extension = url.pathname.match(/\.(mov|mp4|m4v|webm|zip|rar|7z|avi|mxf)$/i)?.[0] || '';
        const base = String(title || 'envato-footage').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, '').slice(0, 140) || 'envato-footage';
        return (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(base) ? '_' : '') +
            base + (extension && !base.toLowerCase().endsWith(extension.toLowerCase()) ? extension : '');
    }
    // WEB_HELPERS_END

    // COLLECTION_HELPERS_START
    function collectionGroups(entries, state) {
        const groups = [{ id:null, name:'', entries:[] }, ...state.folders.map(f => ({ ...f, entries:[] }))];
        const byId = new Map(groups.slice(1).map(group => [group.id, group]));
        for (const entry of entries) (byId.get(state.assignments[entry[0]]) || groups[0]).entries.push(entry);
        return groups;
    }
    function gridShape(count) {
        return { columns: count <= 4 ? 2 : count <= 9 ? 3 : 4, rows: count <= 6 ? 2 : 3 };
    }
    function safeWebUrl(value) {
        try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; }
        catch { return ''; }
    }
    function collectionUrl(value) {
        const safe = safeWebUrl(value);
        if (!safe) return '';
        const u = new URL(safe);
        if (!(u.hostname === 'elements.envato.com' || u.hostname.endsWith('.elements.envato.com')) || u.pathname === '/') return '';
        u.search = ''; u.hash = ''; u.pathname = u.pathname.replace(/\/+$/, '');
        return u.href;
    }
    function normalizeFolders(value, items) {
        const folders = [], assignments = {};
        for (const f of Array.isArray(value?.folders) ? value.folders : []) {
            if (typeof f?.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(f.id) || ['all', 'none'].includes(f.id) || typeof f.name !== 'string' || !f.name.trim() || folders.some(x => x.id === f.id)) continue;
            folders.push({ id: f.id, name: f.name.trim().slice(0, 80) });
        }
        for (const [url, id] of Object.entries(value?.assignments || {})) {
            const key = collectionUrl(url);
            if (Object.hasOwn(items, key) && folders.some(f => f.id === id)) assignments[key] = id;
        }
        return { folders, assignments };
    }
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
    }
    function collectionHTML(name, entries, images) {
        const cards = entries.filter(([url]) => collectionUrl(url)).map(([url, title]) => {
            const img = safeWebUrl(images[url]);
            return `<article><a href="${escapeHTML(collectionUrl(url))}" target="_blank" rel="noopener noreferrer">${img ? `<img loading="lazy" src="${escapeHTML(img)}" alt="">` : `<div class="placeholder">${escapeHTML(UI.noPreview)}</div>`}<h2>${escapeHTML(title)}</h2></a></article>`;
        }).join('\n');
        return `<!doctype html><html lang="${UI_LANG}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(name)}</title><style>body{margin:0;padding:32px;background:#12121f;color:#eee;font:16px system-ui}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:20px}article{border-radius:12px;background:#222235;overflow:hidden}a{color:inherit;text-decoration:none}img,.placeholder{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}.placeholder{display:grid;place-items:center;color:#aaa}h2{font-size:16px;padding:0 16px;overflow-wrap:anywhere}p{color:#aaa}</style><h1>${escapeHTML(name)}</h1><p>Envato Elements · ${entries.filter(([url]) => collectionUrl(url)).length} · ${escapeHTML(UI.exportHelp)}</p><main>${cards}</main></html>`;
    }
    function parseBackup(text) {
        const raw = JSON.parse(text);
        if (raw?.version !== 1 || !raw.picked || typeof raw.picked !== 'object' || Array.isArray(raw.picked)) throw new Error('Invalid backup');
        const picked = {}, thumbnails = {}, videos = {};
        for (const [input, title] of Object.entries(raw.picked)) {
            const url = collectionUrl(input);
            if (!url || typeof title !== 'string') continue;
            picked[url] = title || url;
            if (safeWebUrl(raw.thumbnails?.[input])) thumbnails[url] = safeWebUrl(raw.thumbnails[input]);
            if (safeWebUrl(raw.videos?.[input])) videos[url] = safeWebUrl(raw.videos[input]);
        }
        return { picked, thumbnails, videos, ...normalizeFolders(raw, picked) };
    }
    function mergeBackup(current, data, newId) {
        const result = { picked:{...current.picked}, thumbnails:{...current.thumbnails}, videos:{...current.videos},
            folderState:{ folders:current.folderState.folders.map(f=>({...f})), assignments:{...current.folderState.assignments} } };
        const mapping = new Map();
        for (const folder of data.folders) {
            const existing = result.folderState.folders.find(f=>f.id===folder.id);
            const id = !existing || existing.name===folder.name ? folder.id : newId();
            mapping.set(folder.id,id);
            if(!existing || id!==folder.id) result.folderState.folders.push({id,name:folder.name});
        }
        for(const [url,title] of Object.entries(data.picked)) {
            if(!Object.hasOwn(result.picked,url)) {
                result.picked[url]=title;
                if(data.assignments[url]) result.folderState.assignments[url]=mapping.get(data.assignments[url]);
            }
            if(!result.thumbnails[url] && data.thumbnails[url]) result.thumbnails[url]=data.thumbnails[url];
            if(!result.videos[url] && data.videos[url]) result.videos[url]=data.videos[url];
        }
        return result;
    }
    // COLLECTION_HELPERS_END

    async function runFilestaWorker(id) {
        const jobKey = WEB_JOB_PREFIX + id;
        const job = await GM.getValue(jobKey, null);
        if (!job || job.id !== id || !Array.isArray(job.items)) return;
        if (typeof GM_download !== 'function') return;
        const save = async () => { job.updatedAt = Date.now(); await GM.setValue(jobKey, job); };
        const statusBanner = document.createElement('div');
        statusBanner.setAttribute('translate', 'no');
        statusBanner.id = 'efp-worker-status';
        statusBanner.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483647;padding:12px 16px;background:#211633;color:#eee;border:1px solid #8b5cf6;border-radius:10px;max-width:450px;font:13px system-ui;white-space:pre-line';
        document.body.append(statusBanner);
        const updateBanner = () => { statusBanner.textContent = 'Envato Picker · ' + UI.queue + '\n' + job.items.filter(i => i.status === 'done').length + '/' + job.items.length + ' · ' + (job.message || job.state); };
        const page = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
        const originalOpen = page.open;
        // Let the site's own form prepare the download. Suppress only its file popup;
        // the normal fallback link remains visible and is consumed by GM_download.
        const quietOpen = function(url, ...args) {
            if (isFilestaVideoLink(String(url))) return null;
            return originalOpen.call(this, url, ...args);
        };
        page.open = quietOpen;
        let heartbeatBusy = false;
        const heartbeat = setInterval(async () => {
            if (heartbeatBusy) return;
            heartbeatBusy = true;
            try { await GM.setValue(jobKey + '_heartbeat', Date.now()); } catch { /* Main save reports errors. */ }
            finally { heartbeatBusy = false; }
        }, 3000);
        try {
            // A page reload during a submitted task must never resubmit it silently.
            for (const item of job.items) if (['preparing', 'downloading'].includes(item.status)) {
                item.status = 'review'; item.error = UI.workerTimeout;
            }
            job.state = 'running'; job.message = UI.queueHelp; await save(); updateBanner();
            for (const item of job.items) {
                if (item.status !== 'queued') continue;
                if (await GM.getValue(jobKey + '_stop', false)) { job.state = 'paused'; break; }
                let input, button;
                const deadline = Date.now() + 20000;
                while (Date.now() < deadline) {
                    input = [...document.querySelectorAll('input[placeholder]')].find(el =>
                        /Envato Elements/.test(el.placeholder) && !/лиценз|license/i.test(el.placeholder) && el.getBoundingClientRect().width > 0);
                    button = [...document.querySelectorAll('button')].find(el => /^(Начать загрузку|Start Download)$/i.test(el.textContent.trim()));
                    if (input && button && !button.disabled) break;
                    await wait(500);
                }
                if (!input || !button || button.disabled) { job.state = 'blocked'; job.message = UI.workerForm; break; }
                const oldLinks = new Map([...document.querySelectorAll('[role="alert"] a[href]')].map(a => [a, a.href]));
                const oldAlerts = new Set([...document.querySelectorAll('[role="alert"]')].map(el => el.textContent));
                const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
                setter.call(input, item.url);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                await wait(150);
                // Persist before clicking: an interrupted task needs manual review.
                item.status = 'preparing'; await save(); updateBanner();
                button.click();
                let href = null;
                const readyDeadline = Date.now() + 120000;
                while (Date.now() < readyDeadline) {
                    const link = [...document.querySelectorAll('[role="alert"] a[href]')].find(a =>
                        isFilestaVideoLink(a.href) && oldLinks.get(a) !== a.href);
                    if (link) { href = link.href; break; }
                    const alert = [...document.querySelectorAll('[role="alert"]')].find(el =>
                        !oldAlerts.has(el.textContent) && /ошиб|не удалось|failed|error|verification|проверк|лимит|limit/i.test(el.textContent) &&
                        !/всплывающ|pop-up/i.test(el.textContent));
                    if (alert) { item.error = alert.textContent.trim().slice(0, 250); break; }
                    await wait(500);
                }
                if (!href) { item.status = 'review'; item.error ||= UI.workerTimeout; job.state = 'blocked'; job.message = item.error; await save(); break; }
                item.status = 'downloading'; await save(); updateBanner();
                try {
                    await new Promise((resolve, reject) => {
                        GM_download({ url: href, name: filestaFilename(href, item.title), saveAs: false, conflictAction: 'uniquify',
                            onload: resolve, onerror: () => reject(new Error(UI.downloadError)), ontimeout: () => reject(new Error(UI.downloadError)) });
                    });
                    item.status = 'done'; await save(); updateBanner();
                } catch { item.status = 'failed'; item.error = UI.downloadError; job.state = 'blocked'; job.message = item.error; await save(); break; }
            }
            if (job.state === 'running') job.state = job.items.some(i => ['review', 'failed'].includes(i.status)) ? 'blocked' : 'complete';
            await save(); updateBanner();
        } catch {
            job.state = 'blocked'; job.message = UI.storageError;
            try { await save(); } catch { /* Keep the service page available for review. */ }
            updateBanner();
        } finally {
            clearInterval(heartbeat);
            if (page.open === quietOpen) page.open = originalOpen;
        }
    }

    if (location.hostname === 'filesta.com') {
        const workerId = new URLSearchParams(location.hash.slice(1)).get('efp-job');
        if (workerId && /^[a-f0-9-]{36}$/.test(workerId)) {
            if (navigator.locks) {
                void navigator.locks.request('efp-filesta-' + workerId, { ifAvailable: true }, lock => lock ? runFilestaWorker(workerId) : undefined);
            } else {
                // No reliable worker lock: require a supported browser instead of risking duplicate requests.
                console.warn('[EFP] Web Locks required for Filesta worker');
            }
        }
        return;
    }



    const BASE_URL = 'https://elements.envato.com';
    const STORAGE_KEY = 'envato_picked_footages';
    const FILESTA_URL = 'https://filesta.com/services/envato/content';
    const THUMBNAILS_KEY = 'envato_picked_thumbnails';
    const VIDEOS_KEY = 'envato_picked_videos';
    let videos = await GM.getValue(VIDEOS_KEY, {});
    if (!videos || typeof videos !== 'object' || Array.isArray(videos)) videos = {};
    const previewRequests = new Map();
    const VIEW_KEY = 'envato_picker_view';
    let thumbnails = await GM.getValue(THUMBNAILS_KEY, {});
    if (!thumbnails || typeof thumbnails !== 'object' || Array.isArray(thumbnails)) thumbnails = {};
    let viewMode = await GM.getValue(VIEW_KEY, 'list') === 'grid' ? 'grid' : 'list';
    const ICON_GRID = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="2" width="4" height="4" rx=".5"/><rect x="10" y="2" width="4" height="4" rx=".5"/><rect x="2" y="10" width="4" height="4" rx=".5"/><rect x="10" y="10" width="4" height="4" rx=".5"/></svg>';
    const ICON_LIST = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 3h12M2 8h12M2 13h12"/></svg>';
    const CARD_SELECTOR = '[data-testid="video-card"]';
    const DETAIL_SELECTOR = '[data-testid="page-item-detail"]';
    const CHECK_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><polyline points="2.5,8.5 6.5,12.5 13.5,4"/></svg>';
    const ICON_COPY = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="8" height="10" rx="1.5"/><path d="M3 12H2.5A1.5 1.5 0 0 1 1 10.5v-8A1.5 1.5 0 0 1 2.5 1h7A1.5 1.5 0 0 1 11 2.5V4"/></svg>';
    const ICON_COPY_OK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3,8.5 6.5,12 13,5"/></svg>';
    const ICON_TRASH = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2,4 14,4"/><path d="M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4"/><path d="M3 4l1 9.5A1 1 0 0 0 5 14.5h6a1 1 0 0 0 1-1L13 4"/><line x1="6.5" y1="7" x2="6.5" y2="11.5"/><line x1="9.5" y1="7" x2="9.5" y2="11.5"/></svg>';
    const ICON_REMOVE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>';
    const ICON_LINK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7 4"/><path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L9 12"/></svg>';
    const icon = paths => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
    const ICON_DOWNLOAD = icon('<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>');
    const ICON_FOLDER_PLUS = icon('<path d="M3 7V5h7l2 3h9v12H3V7m9 4v6m-3-3h6"/>');
    const ICON_MORE = icon('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>');
    const ICON_HTML = icon('<path d="M14 3H5v18h14V8l-5-5v5h5M9 12l-3 3 3 3m6-6 3 3-3 3"/>');
    const ICON_SEARCH = icon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>');
    const ICON_UNDO = icon('<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14"/>');
    const ICON_CLAPPER = '<svg viewBox="0 0 28 28" fill="none" aria-hidden="true"><rect x="3" y="11" width="22" height="14" rx="2.5" fill="#2d1b69" stroke="#c4b5fd" stroke-width="1.4"/><rect x="3" y="7" width="22" height="5" rx="1.5" fill="#3b1fa8" stroke="#c4b5fd" stroke-width="1.4"/><path d="M8 7l-2 5m7-5-2 5m7-5-2 5m7-5-2 5" stroke="#c4b5fd" stroke-width="1.3" stroke-linecap="round"/><polygon points="11,15.5 11,21.5 18,18.5" fill="#c4b5fd"/></svg>';

    let picked;
    try {
        const stored = await GM.getValue(STORAGE_KEY, {});
        picked = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch (error) {
        console.error('[EFP] Failed to load saved items:', error);
        picked = {};
    }

    function canonicalUrl(input) {
        try {
            const url = new URL(input, BASE_URL);
            if (url.hostname !== 'elements.envato.com' && !url.hostname.endsWith('.elements.envato.com')) return null;
            if (url.protocol !== 'https:') return null;
            url.hash = '';
            url.search = '';
            url.pathname = url.pathname.replace(/\/+$/, '') || '/';
            return url.href;
        } catch {
            return null;
        }
    }

    // Preserve the existing storage key and merge equivalent URLs from older versions.
    const normalized = {};
    for (const [url, title] of Object.entries(picked)) {
        const key = canonicalUrl(url);
        if (key) normalized[key] = typeof title === 'string' && title ? title : key;
    }
    picked = normalized;

    const FOLDERS_KEY = 'envato_picker_folders';
    let folderState = normalizeFolders(await GM.getValue(FOLDERS_KEY, null), picked);
    let sortOrder = 'added';
    const COLLAPSED_GROUPS_KEY = 'envato_picker_collapsed_groups';
    const storedCollapsedGroups = await GM.getValue(COLLAPSED_GROUPS_KEY, []);
    const collapsedGroups = new Set((Array.isArray(storedCollapsedGroups) ? storedCollapsedGroups : []).filter(id => folderState.folders.some(f => f.id === id)));
    const selectedUrls = new Set();
    let undoState = null, renderSignature = '', collectionNotice = '';
    const previewFailures = new Map();

    function visibleEntries() {
        const entries = Object.entries(picked);
        if (sortOrder !== 'added') entries.sort((a,b) => a[1].localeCompare(b[1], UI_LANG, { numeric:true }) * (sortOrder === 'za' ? -1 : 1));
        return entries;
    }
    function actionEntries() {
        const entries = visibleEntries();
        return selectedUrls.size ? entries.filter(([url]) => selectedUrls.has(url)) : entries;
    }
    function rememberUndo() {
        undoState = { picked: { ...picked }, folderState: structuredClone(folderState) };
        collectionNotice = UI.changed;
    }
    function saveCollection() {
        const snapshot = structuredClone({ picked, thumbnails, videos, folderState, collapsedGroups:[...collapsedGroups] });
        saveQueue = saveQueue.catch(() => {}).then(async () => {
            await GM.setValue(STORAGE_KEY, snapshot.picked);
            await GM.setValue(THUMBNAILS_KEY, snapshot.thumbnails);
            await GM.setValue(VIDEOS_KEY, snapshot.videos);
            await GM.setValue(FOLDERS_KEY, snapshot.folderState);
            await GM.setValue(COLLAPSED_GROUPS_KEY, snapshot.collapsedGroups);
        });
        saveQueue.catch(error => { collectionNotice = UI.saveError; renderCollectionTools(); console.error('[EFP] Save failed:', error); });
        return saveQueue;
    }
    function finishCollectionChange() {
        renderList(); refreshButtons(); void saveCollection();
    }
    function downloadText(text, name, type) {
        const href = URL.createObjectURL(new Blob([text], { type }));
        const a = document.createElement('a'); a.href = href; a.download = name; a.hidden = true;
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(href), 60000);
    }

    let activeBatch = null;
    let workerTab = null;
    let queueNotice = '';
    let pollBusy = false;
    let startingBatch = false;
    let savedBatchId = null;
    try { savedBatchId = sessionStorage.getItem('efp-filesta-batch'); } catch { /* Current session still works. */ }
    if (savedBatchId) activeBatch = await GM.getValue(WEB_JOB_PREFIX + savedBatchId, null);

    function revealDownloads() {
        document.getElementById('efp-drawer')?.classList.add('efp-open');
        document.getElementById('efp-toggle')?.setAttribute('aria-expanded', 'true');
        const section = document.getElementById('efp-downloads');
        if (section) section.hidden = false;
        renderWebDownloads();
    }

    async function startWebDownloads(entries) {
        revealDownloads();
        if (startingBatch || activeBatch?.state === 'running' || activeBatch?.state === 'queued' || activeBatch?.items.some(i => i.status === 'queued')) {
            queueNotice = UI.busy; renderWebDownloads(); return;
        }
        const items = normalizeDownloadEntries(entries);
        if (!items.length) return;
        if (typeof GM_openInTab !== 'function') { queueNotice = UI.needsManager; renderWebDownloads(); return; }
        startingBatch = true;
        try {
            const batch = { id: crypto.randomUUID(), items, state: 'queued', message: '', updatedAt: Date.now() };
            await GM.setValue(WEB_JOB_PREFIX + batch.id, batch);
            activeBatch = batch;
            try { sessionStorage.setItem('efp-filesta-batch', batch.id); } catch { /* Optional reload recovery. */ }
            queueNotice = '';
            workerTab = GM_openInTab(WEB_WORKER_URL + '#efp-job=' + batch.id, { active: false, insert: true, setParent: true });
            renderWebDownloads();
        } catch {
            queueNotice = UI.storageError;
            if (activeBatch?.state === 'queued') { activeBatch.state = 'blocked'; await GM.setValue(WEB_JOB_PREFIX + activeBatch.id, activeBatch).catch(() => {}); }
            renderWebDownloads();
        }
        finally { startingBatch = false; }
    }

    async function pollWebDownloads() {
        if (pollBusy || !activeBatch) return;
        pollBusy = true;
        try {
            const value = await GM.getValue(WEB_JOB_PREFIX + activeBatch.id, activeBatch);
            const changed = JSON.stringify(value) !== JSON.stringify(activeBatch);
            activeBatch = value;
            if (['queued', 'running'].includes(activeBatch.state)) {
                const heartbeat = await GM.getValue(WEB_JOB_PREFIX + activeBatch.id + '_heartbeat', activeBatch.updatedAt);
                if (Date.now() - heartbeat > 45000) {
                    queueNotice = UI.noWorker;
                    // Do not resubmit: the task may already have been accepted by the service.
                    renderWebDownloads();
                } else if (queueNotice === UI.noWorker) { queueNotice = ''; renderWebDownloads(); }
            }
            if (changed) renderWebDownloads();
        } catch { queueNotice = UI.storageError; renderWebDownloads(); }
        finally { pollBusy = false; }
    }

    function renderWebDownloads() {
        const list = document.getElementById('efp-download-list');
        if (!list) return;
        document.getElementById('efp-download-message').textContent = queueNotice || activeBatch?.message || UI.queueHelp;
        list.replaceChildren();
        for (const item of activeBatch?.items || []) {
            const row = document.createElement('div'); row.className = 'efp-download-row';
            const title = document.createElement('span'); title.textContent = item.title; title.title = item.title;
            const status = document.createElement('small'); status.textContent = UI[item.status] || UI.blocked;
            row.append(title, status);
            if (item.error) { const error = document.createElement('small'); error.className = 'efp-download-error'; error.textContent = item.error; row.append(error); }
            list.append(row);
        }
        if (!activeBatch?.items.length) list.textContent = UI.emptyQueue;
        const stop = document.getElementById('efp-download-stop');
        stop.disabled = !activeBatch || !['running', 'queued'].includes(activeBatch.state);
        const resume = document.getElementById('efp-download-resume');
        resume.hidden = !activeBatch || !['paused', 'blocked'].includes(activeBatch.state) || !activeBatch.items.some(i => i.status === 'queued');
        document.getElementById('efp-download-cancel').hidden = resume.hidden;
        const link = document.getElementById('efp-worker-link');
        link.hidden = !activeBatch;
        if (activeBatch) link.href = WEB_WORKER_URL + '#efp-job=' + activeBatch.id;
    }

    GM_addStyle(`
        .efp-check-btn { position:absolute; top:8px; left:8px; z-index:20; width:26px; height:26px; padding:0; border-radius:6px; border:1.5px solid rgba(255,255,255,.75); background:rgba(0,0,0,.55); cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); box-shadow:0 2px 6px rgba(0,0,0,.4); }
        .efp-check-btn:hover { background:rgba(0,0,0,.75); border-color:#fff; transform:scale(1.08); }
        .efp-check-btn.efp-active { background:#00c16e; border-color:#00c16e; }
        .efp-check-btn svg { width:14px; height:14px; fill:none; stroke:#fff; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; opacity:0; }
        .efp-check-btn.efp-active svg { opacity:1; }
        #efp-panel { position:fixed; bottom:24px; right:24px; z-index:2147483647; font:13px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; display:flex; flex-direction:column; align-items:flex-end; }
        #efp-panel button, #efp-detail-actions button { font-family:inherit; }
        #efp-toggle { position:relative; width:56px; height:56px; padding:0; background:radial-gradient(circle at 40% 35%,#4c1d95,#1e0a4a); border:1.5px solid rgba(196,181,253,.35); border-radius:50%; cursor:pointer; box-shadow:0 4px 22px rgba(76,29,149,.55); display:flex; align-items:center; justify-content:center; }
        #efp-toggle:hover { transform:scale(1.06); }
        #efp-toggle svg { width:30px; height:30px; }
        #efp-count { position:absolute; top:-4px; right:-4px; min-width:20px; height:20px; box-sizing:border-box; padding:0 5px; background:#00c16e; color:#fff; border-radius:10px; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; border:1.5px solid #12121f; }
        #efp-count.efp-empty { background:#444; }
        #efp-drawer { background:#12121f; border-radius:12px; margin-bottom:10px; overflow:hidden; box-shadow:0 6px 28px rgba(0,0,0,.55); width:min(400px,calc(100vw - 48px)); display:none; opacity:0; transform:translateY(12px) scale(.98); transform-origin:bottom right; transition:opacity .18s ease,transform .18s ease,display .18s allow-discrete; }
        #efp-drawer.efp-grid-view { width:min(var(--efp-width,440px),calc(100vw - 48px)); container-type:inline-size; }
        #efp-drawer.efp-open { display:flex; flex-direction:column; }
        #efp-drawer.efp-open { opacity:1; transform:none; }
        @starting-style { #efp-drawer.efp-open { opacity:0; transform:translateY(12px) scale(.98); } }
        @media (prefers-reduced-motion:reduce) { #efp-drawer { transition:none; } }
        #efp-drawer-header { display:flex; align-items:center; justify-content:space-between; padding:11px 14px; border-bottom:1px solid rgba(255,255,255,.07); }
        .efp-drawer-title { color:#999; font-size:11px; text-transform:uppercase; letter-spacing:.8px; flex:1; }
        .efp-header-actions { display:flex; gap:2px; }
        .efp-hdr-btn { width:30px; height:30px; padding:0; background:transparent; color:#aaa; border:0; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .efp-hdr-btn svg { width:14px; height:14px; stroke:currentColor; }
        #efp-filesta-btn { font-size:16px; font-weight:700; text-decoration:none; margin-right:6px; }
        #efp-filesta-btn:hover, #efp-view-btn:hover { background:rgba(124,58,237,.2); color:#c4b5fd; }
        #efp-list.efp-grid { --efp-cell:calc((100cqw - 20px - (var(--efp-cols) - 1)*8px)/var(--efp-cols)*.5625 + 38px); display:grid; grid-template-columns:repeat(var(--efp-cols),minmax(0,1fr)); grid-auto-rows:var(--efp-cell); align-content:start; gap:8px; padding:10px; box-sizing:border-box; height:min(calc(var(--efp-cell)*var(--efp-rows) + (var(--efp-rows) - 1)*8px + 20px),calc(100dvh - 280px)); min-height:150px; max-height:none; }
        .efp-grid .efp-list-item { position:relative; flex-wrap:wrap; padding:0 0 6px; overflow:hidden; border-radius:6px; background:rgba(255,255,255,.04); }
        .efp-grid .efp-list-item-url { flex:0 0 100%; white-space:normal; text-decoration:none; }
        .efp-thumbnail { display:flex; align-items:center; justify-content:center; position:relative; width:100%; aspect-ratio:16/9; background:#242435; color:#777; overflow:hidden; }
        .efp-thumbnail img { width:100%; height:100%; object-fit:cover; }
        .efp-thumbnail video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; background:#242435; }
        .efp-thumbnail-title { display:block; padding:6px 8px 0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
        .efp-grid .efp-list-filesta { margin-left:8px; }
        .efp-grid #efp-empty-msg { grid-column:1 / -1; }
        #efp-copy-btn:hover, #efp-copy-btn.efp-copied { background:rgba(0,193,110,.15); color:#00c16e; }
        #efp-clear-btn:hover { background:rgba(224,85,85,.15); color:#e05555; }
        #efp-list { max-height:min(300px,50vh); overflow-y:auto; padding:6px 0; }
        .efp-list-item { display:flex; align-items:center; padding:5px 12px 5px 14px; gap:6px; }
        .efp-list-item:hover { background:rgba(255,255,255,.04); }
        .efp-list-item-url { color:#7ec8f7; text-decoration:none; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; }
        .efp-list-item-url:hover { color:#aee0ff; text-decoration:underline; }
        .efp-list-filesta, .efp-list-item-remove { display:flex; align-items:center; justify-content:center; width:24px; height:24px; flex-shrink:0; border-radius:5px; border:0; background:rgba(255,255,255,.05); cursor:pointer; color:#aaa; text-decoration:none; padding:0; }
        .efp-list-filesta svg { width:12px; height:12px; stroke:currentColor; }
        .efp-list-item-remove svg { width:11px; height:11px; stroke:currentColor; }
        .efp-list-filesta:hover { background:rgba(124,58,237,.2); color:#c4b5fd; }
        .efp-list-item-remove:hover { background:rgba(224,85,85,.1); color:#e05555; }
        #efp-empty-msg { color:#777; text-align:center; padding:20px 0 16px; font-size:12px; }
        [data-testid="page-item-detail"] [data-testid="subscribe-cta-button"] { display:none !important; }
        #efp-detail-actions { display:block; width:100%; margin:8px 0; }
        #efp-detail-actions > button { display:flex; align-items:center; justify-content:center; gap:8px; box-sizing:border-box; width:100%; min-height:48px; padding:10px 16px; border:1.5px solid transparent; border-radius:8px; cursor:pointer; font-family:inherit; font-size:16px; font-weight:600; font-style:normal; letter-spacing:normal; text-decoration:none; line-height:24px; }
        #efp-detail-actions > button > span { text-box:trim-both cap alphabetic; }
        #efp-detail-btn { background:#87e64b; color:#191919; border:1.5px solid #87e64b; }
        #efp-detail-btn:hover { background:#79d43e; }
        #efp-detail-btn.efp-active { background:#441a88; border-color:#441a88; color:#fff; }
        #efp-detail-actions > button svg { width:18px; height:18px; flex:0 0 18px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
        #efp-download-all, #efp-downloads button { cursor:pointer; font:inherit; border:1px solid #65508e; border-radius:6px; padding:7px 10px; color:#eee; background:#35234f; }
        #efp-filesta-download { margin-top:8px; color:#eee; background:#35234f; border-color:#65508e; }
        #efp-download-all { display:block; margin:8px 12px; width:calc(100% - 24px); }
        #efp-download-all:disabled { opacity:.45; cursor:default; }
        #efp-downloads { border-top:1px solid #373044; padding:12px; color:#ddd; font-size:12px; }
        #efp-downloads[hidden], #efp-downloads [hidden] { display:none; }
        #efp-downloads button:disabled { opacity:.45; cursor:default; }
        #efp-download-message { color:#c4b5fd; overflow-wrap:anywhere; line-height:1.5; }
        #efp-download-list { max-height:160px; overflow:auto; margin:10px 0; }
        .efp-download-row { display:flex; align-items:center; flex-wrap:wrap; gap:6px; border-top:1px solid #373044; padding:8px 0; }
        .efp-download-row > span { flex:1; min-width:100px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
        .efp-download-row > small { color:#bcb6cc; }
        .efp-download-row > .efp-download-error { flex:0 0 100%; color:#f39b9b; }
        #efp-worker-link { display:block; color:#b9a4f8; margin-top:10px; }
        #efp-drawer { max-height:calc(100dvh - 110px); overflow:hidden; }
        #efp-drawer-header, #efp-tools, #efp-download-all, #efp-notice { flex-shrink:0; }
        #efp-list { flex-shrink:1; min-height:60px; }
        #efp-downloads { overflow:auto; min-height:60px; }
        #efp-downloads[hidden] { min-height:0; }
        @media(max-height:600px) { #efp-drawer { overflow-y:auto; } #efp-list { flex-shrink:0; } }
        #efp-tools { padding:10px 12px; display:grid; gap:8px; border-bottom:1px solid #373044; color:#eee; }
        .efp-tool-row { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
        #efp-tools input:not([type=checkbox]), #efp-tools select { min-width:0; flex:1; background:#242435; color:#eee; border:1px solid #494159; border-radius:6px; padding:6px; font:inherit; }
        #efp-tools button, #efp-undo { background:#30213f; color:#ddd; border:1px solid #534264; border-radius:6px; padding:5px 8px; font:inherit; cursor:pointer; }
        #efp-tools button:disabled { opacity:.4; cursor:default; }
        #efp-tools [hidden], #efp-notice[hidden] { display:none; }
        #efp-search { width:100%; box-sizing:border-box; }
        #efp-selection-count { font-size:11px; color:#c4b5fd; }
        .efp-item-select { accent-color:#9c6aff; width:17px; height:17px; flex-shrink:0; cursor:pointer; }
        .efp-grid .efp-item-select { position:absolute; top:7px; left:7px; z-index:2; margin:0; }
        .efp-list-item.efp-selected { outline:2px solid #9c6aff; outline-offset:-2px; background:#302348; }
        #efp-notice { padding:6px 12px; color:#c4b5fd; font-size:12px; display:flex; justify-content:space-between; align-items:center; gap:8px; }
        #efp-panel :focus-visible { outline:2px solid #bca2ff; outline-offset:2px; }
        @media(max-width:560px) { #efp-list.efp-grid { --efp-cols:2 !important; } #efp-panel { right:12px; bottom:12px; } }
        #efp-drawer { border:1px solid #ffffff14; background:linear-gradient(145deg,#1d1b2c,#11111c 65%); }
        #efp-drawer-header { padding:10px 12px; }
        .efp-drawer-title { color:#e8e4f5; font-size:13px; font-weight:600; text-transform:none; letter-spacing:0; }
        .efp-header-actions { gap:3px; }
        #efp-panel .efp-icon-btn { display:inline-flex; width:32px; height:32px; flex:0 0 32px; align-items:center; justify-content:center; padding:0; border:0; border-radius:8px; background:transparent; color:#b8b2c8; cursor:pointer; margin:0; }
        #efp-panel .efp-icon-btn svg { width:17px; height:17px; }
        #efp-panel .efp-icon-btn:hover { color:#fff; background:#ffffff12; }
        #efp-panel .efp-icon-btn:disabled { opacity:.3; cursor:default; }
        #efp-panel #efp-download-all { background:#8154db; color:white; box-shadow:inset 0 1px #ffffff26; }
        #efp-panel #efp-download-all:hover { background:#9465ef; }
        #efp-more-btn[aria-expanded=true] { background:#ffffff12; color:white; }
        #efp-tools { padding:8px 12px; gap:7px; }
        #efp-tools select, #efp-tools input:not([type=checkbox]) { border-color:transparent; background:#ffffff06; border-radius:7px; }
        #efp-tools select:hover, #efp-tools input:focus { border-color:#ffffff20; }
        #efp-all-label { display:flex; align-items:center; justify-content:center; width:24px; flex:0 0 24px; cursor:pointer; }
        #efp-select-all { width:15px; height:15px; accent-color:#9c6aff; cursor:pointer; }
        .efp-searchbox { display:flex; align-items:center; gap:6px; padding-left:6px; color:#777185; }
        .efp-searchbox svg { width:15px; height:15px; flex-shrink:0; }
        #efp-tools .efp-searchbox input { background:transparent; padding:5px 2px; }
        #efp-selection { padding-top:6px; border-top:1px solid #ffffff0d; }
        #efp-selection-count { white-space:nowrap; }
        #efp-more-actions { display:grid; gap:3px; padding:6px; border:1px solid #ffffff12; border-radius:9px; background:#252134; }
        #efp-more-actions button { display:flex; align-items:center; gap:10px; padding:8px 10px; text-align:left; background:none; border:0; color:#d4cede; width:100%; height:auto; justify-content:flex-start; }
        #efp-more-actions button:hover { background:#ffffff0c; }
        #efp-more-actions svg { width:16px; height:16px; flex-shrink:0; }
        #efp-more-actions #efp-clear-btn { color:#ee9ca9; }
        #efp-more-actions .efp-tool-row { padding:3px 8px; }
        #efp-more-actions label { color:#aaa0b9; font-size:12px; }
        .efp-grid .efp-list-filesta, .efp-grid .efp-list-item-remove { position:absolute; top:7px; margin:0; z-index:2; background:#12121fd9; color:#eee; }
        .efp-grid .efp-list-filesta { right:35px; }
        .efp-grid .efp-list-item-remove { right:7px; }
        @media(hover:hover) { .efp-list-filesta,.efp-list-item-remove { opacity:0; } .efp-list-item:hover .efp-list-filesta,.efp-list-item:hover .efp-list-item-remove,.efp-list-item:focus-within .efp-list-filesta,.efp-list-item:focus-within .efp-list-item-remove { opacity:1; } }
        .efp-grid .efp-thumbnail-title { padding-top:8px; }
        #efp-notice { padding:3px 12px; }
        #efp-panel { color-scheme:dark; }
        @media(hover:hover) { .efp-grid .efp-item-select { opacity:0; } .efp-grid .efp-list-item:hover .efp-item-select,.efp-grid .efp-list-item:focus-within .efp-item-select,.efp-grid .efp-selected .efp-item-select { opacity:1; } }
        #efp-downloads-heading { display:flex; align-items:center; justify-content:space-between; }
        #efp-panel.efp-fullscreen { inset:12px; align-items:stretch; }
        #efp-panel.efp-fullscreen #efp-drawer { width:100%; height:100%; max-height:none; margin:0; box-sizing:border-box; }
        #efp-panel.efp-fullscreen #efp-toggle { display:none; }
        #efp-panel.efp-fullscreen #efp-list { flex:1; max-height:none; }
        #efp-panel.efp-fullscreen #efp-list.efp-grid { height:auto; grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr)); grid-auto-rows:auto; }
        #efp-panel.efp-fullscreen .efp-list-item { min-height:0; }
        #efp-list.efp-grid { display:block; }
        .efp-group { margin:0 0 8px; border:1px solid #ffffff0c; border-radius:9px; overflow:hidden; }
        .efp-group-title { display:flex; align-items:center; gap:8px; padding:10px 12px; cursor:pointer; list-style:none; color:#e4ddef; font-size:12px; font-weight:600; background:#ffffff05; }
        .efp-group-title::-webkit-details-marker { display:none; }
        .efp-group-title:hover { background:#ffffff0a; }
        .efp-group-title > svg { width:14px; height:14px; flex:0 0 14px; color:#ae94dc; }
        .efp-group[open] > .efp-group-title > svg { transform:rotate(90deg); }
        .efp-group-name { flex:1; min-width:0; overflow-wrap:anywhere; }
        .efp-group-count { padding:2px 6px; border-radius:6px; color:#b6a8c9; background:#ffffff08; font:inherit; }
        .efp-group-empty,.efp-ungrouped-title { padding:9px 12px; color:#8f859e; font-size:11px; }
        .efp-group-items { padding:3px 0; }
        .efp-grid .efp-group-items { display:grid; grid-template-columns:repeat(var(--efp-cols),minmax(0,1fr)); grid-auto-rows:var(--efp-cell); gap:8px; padding:8px; }
        .efp-grid > .efp-group-items { padding:0 0 8px; }
        .efp-grid .efp-group-empty { grid-column:1 / -1; }
        .efp-group:not([open]) > .efp-group-items { display:none; }
        #efp-panel.efp-fullscreen .efp-grid .efp-group-items { grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr)); grid-auto-rows:auto; }
        #efp-new-folder { margin-left:auto !important; }
        #efp-fullscreen-btn[aria-pressed=true] { background:#ffffff12; color:white; }
        @media(max-width:400px) { .efp-drawer-title { font-size:11px; } .efp-header-actions { gap:0; } #efp-drawer-header { padding:8px; } }
    `);

    function makeButton(id, title, icon) {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = id;
        button.className = 'efp-hdr-btn';
        button.classList.add('efp-icon-btn');
        button.title = title;
        button.setAttribute('aria-label', title);
        button.innerHTML = icon;
        return button;
    }

    function renderCollectionTools() {
        const create = document.getElementById('efp-new-folder');
        if (!create) return;
        create.disabled = !selectedUrls.size;
        const options = folderState.folders.map(f => [f.id, f.name]);
        const move = document.getElementById('efp-move');
        if (move.dataset.options !== JSON.stringify(options)) {
            move.replaceChildren(new Option(UI.move, ''), new Option(UI.noFolder, 'none'), ...folderState.folders.map(f => new Option(f.name, f.id)));
            move.dataset.options = JSON.stringify(options);
        }
        if (!selectedUrls.size) document.getElementById('efp-folder-form').hidden=true;
        document.getElementById('efp-selection-count').textContent = UI.selected + ': ' + selectedUrls.size;
        document.getElementById('efp-selection').hidden = !selectedUrls.size;
        document.getElementById('efp-move').disabled = !selectedUrls.size;
        document.getElementById('efp-remove-selected').disabled = !selectedUrls.size;
        const visible = visibleEntries();
        const all = document.getElementById('efp-select-all');
        all.checked = visible.length > 0 && selectedUrls.size === visible.length;
        all.indeterminate = selectedUrls.size > 0 && selectedUrls.size < visible.length;
        all.disabled = !visible.length;
        const download = document.getElementById('efp-download-all');
        if (download) { download.title = (selectedUrls.size ? UI.downloadSelected : UI.downloadVisible) + ' · ' + actionEntries().length; download.setAttribute('aria-label',download.title); download.disabled = !visible.length; }
        document.getElementById('efp-export-html').disabled = !visible.length;
        const notice = document.getElementById('efp-notice');
        notice.hidden = !collectionNotice && !undoState;
        document.getElementById('efp-notice-text').textContent = collectionNotice;
        document.getElementById('efp-undo').hidden = !undoState;
        document.querySelectorAll('#efp-list .efp-item-select').forEach(input => {
            input.checked = selectedUrls.has(input.dataset.url);
            input.closest('.efp-list-item').classList.toggle('efp-selected', input.checked);
        });
    }

    function buildCollectionTools() {
        const tools = document.createElement('div'); tools.id = 'efp-tools';
        const row = () => { const el = document.createElement('div'); el.className = 'efp-tool-row'; tools.append(el); return el; };
        const button = (id, text, fn, svg) => { const el = document.createElement('button'); el.type='button'; el.id=id; el.title=text; el.setAttribute('aria-label',text); if(svg){el.innerHTML=svg;el.className='efp-icon-btn';}else el.textContent=text; el.addEventListener('click', fn); return el; };
        const top = row();
        top.append(button('efp-new-folder',UI.newFolder, () => { if(!selectedUrls.size)return; form.hidden = !form.hidden; if (!form.hidden) name.focus(); },ICON_FOLDER_PLUS));
        const form = row(); form.id='efp-folder-form'; form.hidden=true;
        const name = document.createElement('input'); name.id='efp-folder-name'; name.placeholder=UI.folderName; name.maxLength=80; name.setAttribute('aria-label',UI.folderName);
        const createFolder = () => {
            if (!selectedUrls.size) return;
            const value = name.value.trim(); if (!value) { name.focus(); return; }
            rememberUndo();
            const id = crypto.randomUUID(); folderState.folders.push({id,name:value});
            selectedUrls.forEach(url => { folderState.assignments[url]=id; });
            collapsedGroups.delete(id); selectedUrls.clear(); name.value=''; form.hidden=true; finishCollectionChange();
        };
        name.addEventListener('keydown', e => { if (e.key === 'Enter') createFolder(); if(e.key==='Escape') form.hidden=true; });
        form.append(name,button('efp-create-folder',UI.create,createFolder,ICON_COPY_OK),button('efp-cancel-folder',UI.cancel,()=>{form.hidden=true;},ICON_REMOVE));
        const advanced = document.createElement('div'); advanced.id='efp-more-actions'; advanced.hidden=true;
        const filters = document.createElement('div'); filters.className='efp-tool-row'; advanced.append(filters);
        const allLabel = document.createElement('label'), all=document.createElement('input'); all.type='checkbox'; all.id='efp-select-all'; all.setAttribute('aria-label',UI.selectAll);
        all.addEventListener('change',()=>{ selectedUrls.clear(); if(all.checked) visibleEntries().forEach(([url])=>selectedUrls.add(url)); renderCollectionTools(); });
        allLabel.id='efp-all-label'; allLabel.title=UI.selectAll; allLabel.append(all); top.prepend(allLabel);
        const sort=document.createElement('select'); sort.id='efp-sort'; sort.setAttribute('aria-label',UI.sort);
        sort.append(new Option(UI.added,'added'),new Option(UI.az,'az'),new Option(UI.za,'za'));
        sort.addEventListener('change',()=>{sortOrder=sort.value;renderList();});
        const sortLabel=document.createElement('label');sortLabel.htmlFor='efp-sort';sortLabel.textContent=UI.sort;filters.append(sortLabel,sort);
        const selection=row(), count=document.createElement('span'); count.id='efp-selection-count';
        selection.id='efp-selection'; selection.hidden=true;
        const move=document.createElement('select'); move.id='efp-move'; move.setAttribute('aria-label',UI.move);
        move.addEventListener('change',()=>{
            if(!move.value || !selectedUrls.size) return;
            rememberUndo(); selectedUrls.forEach(url=>{ if(move.value==='none') delete folderState.assignments[url]; else folderState.assignments[url]=move.value; });
            collapsedGroups.delete(move.value);
            move.value=''; selectedUrls.clear(); finishCollectionChange();
        });
        selection.append(count,move,button('efp-remove-selected',UI.removeSelected,()=>{
            if(!selectedUrls.size) return; rememberUndo(); selectedUrls.forEach(url=>{delete picked[url];delete folderState.assignments[url];}); selectedUrls.clear(); finishCollectionChange();
        },ICON_TRASH));
        const exports=advanced;
        tools.append(button('efp-export-html',UI.exportHTML,()=>{
            downloadText(collectionHTML(UI.picked,actionEntries(),thumbnails),'envato-collection.html','text/html;charset=utf-8');
        },ICON_HTML));
        exports.append(button('efp-export-json',UI.exportJSON,()=>{
            downloadText(JSON.stringify({version:1,picked,thumbnails:Object.fromEntries(Object.keys(picked).filter(u=>thumbnails[u]).map(u=>[u,thumbnails[u]])),videos:Object.fromEntries(Object.keys(picked).filter(u=>videos[u]).map(u=>[u,videos[u]])),...folderState},null,2),'envato-backup.json','application/json');
        }));
        const file=document.createElement('input'); file.type='file'; file.accept='.json,application/json'; file.hidden=true; file.id='efp-import-file';
        file.addEventListener('change',async()=>{
            try {
                const f=file.files[0]; if(!f) return; if(f.size>10*1024*1024) throw new Error('Too large');
                const data=parseBackup(await f.text()); rememberUndo();
                ({picked,thumbnails,videos,folderState}=mergeBackup({picked,thumbnails,videos,folderState},data,()=>crypto.randomUUID()));
                selectedUrls.clear(); collectionNotice=UI.imported; finishCollectionChange();
            } catch { collectionNotice=UI.importError; renderCollectionTools(); }
            finally { file.value=''; }
        });
        exports.append(button('efp-import-json',UI.importJSON,()=>file.click()),file);
        tools.append(advanced);
        return tools;
    }

    function renderList() {
        const list = document.getElementById('efp-list');
        const badge = document.getElementById('efp-count');
        if (!list || !badge) return;
        const entries = visibleEntries();
        for (const url of selectedUrls) if (!entries.some(([u]) => u === url)) selectedUrls.delete(url);
        badge.textContent = String(Object.keys(picked).length);
        badge.classList.toggle('efp-empty', !Object.keys(picked).length);
        renderCollectionTools();
        const signature = JSON.stringify([entries, entries.map(([url]) => thumbnails[url]), viewMode, folderState]);
        if (signature === renderSignature) return;
        renderSignature = signature;
        const downloadAll = document.getElementById('efp-download-all');
        if (downloadAll) downloadAll.disabled = entries.length === 0;
        badge.textContent = String(Object.keys(picked).length);
        badge.classList.toggle('efp-empty', !Object.keys(picked).length);
        document.getElementById('efp-drawer').classList.toggle('efp-grid-view', viewMode === 'grid');
        const shape = gridShape(entries.length);
        document.getElementById('efp-drawer').style.setProperty('--efp-width', (shape.columns * 206 + 20) + 'px');
        list.style.setProperty('--efp-cols',shape.columns);
        list.style.setProperty('--efp-rows',shape.rows);
        list.querySelectorAll('video').forEach(video => video.pause());
        list.classList.toggle('efp-grid', viewMode === 'grid');
        const view = document.getElementById('efp-view-btn');
        if (view) {
            view.innerHTML = viewMode === 'grid' ? ICON_LIST : ICON_GRID;
            view.title = viewMode === 'grid' ? UI.showList : UI.showThumbnails;
            view.setAttribute('aria-label', view.title);
            view.setAttribute('aria-pressed', String(viewMode === 'grid'));
        }
        list.replaceChildren();
        if (!entries.length && !folderState.folders.length) {
            const empty = document.createElement('div');
            empty.id = 'efp-empty-msg';
            empty.textContent = Object.keys(picked).length ? UI.nothingFound : UI.empty;
            list.append(empty);
            return;
        }
        const fragment = document.createDocumentFragment();
        for (const group of collectionGroups(entries, folderState)) {
            if (!group.id && !group.entries.length) continue;
            const content = document.createElement('div'); content.className='efp-group-items';
            if (group.id) {
                const disclosure = document.createElement('details'); disclosure.className='efp-group'; disclosure.dataset.groupId=group.id;
                disclosure.open = !collapsedGroups.has(group.id);
                const summary = document.createElement('summary'); summary.className='efp-group-title';
                summary.innerHTML = icon('<path d="m9 5 7 7-7 7"/>');
                const label = document.createElement('span'); label.className='efp-group-name'; label.textContent=group.name;
                const count = document.createElement('small'); count.className='efp-group-count'; count.textContent=String(group.entries.length);
                summary.append(label,count); disclosure.append(summary,content); fragment.append(disclosure);
                disclosure.addEventListener('toggle',()=>{
                    if(!disclosure.isConnected) return;
                    if (!disclosure.open) content.querySelectorAll('.efp-list-item').forEach(row=>row.dispatchEvent(new Event('mouseleave')));
                    if(collapsedGroups.has(group.id) === !disclosure.open) return;
                    if(disclosure.open)collapsedGroups.delete(group.id);else collapsedGroups.add(group.id);
                    void saveCollection();
                });
                if (!group.entries.length) { const empty=document.createElement('div'); empty.className='efp-group-empty';empty.textContent=UI.emptyGroup;content.append(empty); }
            } else {
                if(folderState.folders.length) { const label=document.createElement('div');label.className='efp-ungrouped-title';label.textContent=UI.noFolder;fragment.append(label); }
                fragment.append(content);
            }
        for (const [url, title] of group.entries) {
            const row = document.createElement('div');
            row.className = 'efp-list-item';
            row.classList.toggle('efp-selected',selectedUrls.has(url));
            const checkbox = document.createElement('input'); checkbox.type='checkbox'; checkbox.className='efp-item-select'; checkbox.dataset.url=url;
            checkbox.checked=selectedUrls.has(url); checkbox.setAttribute('aria-label',UI.select+': '+title);
            checkbox.addEventListener('change',()=>{ if(checkbox.checked) selectedUrls.add(url); else selectedUrls.delete(url); renderCollectionTools(); });
            const link = document.createElement('a');
            link.className = 'efp-list-item-url';
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = title;
            if (viewMode === 'grid') {
                const preview = document.createElement('span');
                preview.className = 'efp-thumbnail';
                preview.textContent = UI.noPreview;
                if (thumbnails[url]) {
                    const image = document.createElement('img');
                    image.src = thumbnails[url];
                    image.alt = title;
                    image.loading = 'lazy';
                    image.addEventListener('error', () => { image.remove(); preview.prepend(document.createTextNode(UI.noPreview)); }, { once: true });
                    preview.replaceChildren(image);
                }
                const caption = document.createElement('span');
                caption.className = 'efp-thumbnail-title';
                caption.textContent = title === url ? new URL(url).pathname.slice(1) : title;
                link.append(preview, caption);
                attachVideoPreview(row, preview, url);
            } else link.textContent = title;
            const filesta = document.createElement('button');
            filesta.type = 'button';
            filesta.className = 'efp-list-filesta';
            filesta.addEventListener('click', () => { void startWebDownloads([[url, title]]); });
            filesta.title = UI.downloadFilesta;
            filesta.setAttribute('aria-label', filesta.title);
            filesta.innerHTML = ICON_DOWNLOAD;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'efp-list-item-remove';
            remove.title = UI.remove;
            remove.setAttribute('aria-label', `${UI.remove}: ${title}`);
            remove.innerHTML = ICON_REMOVE;
            remove.addEventListener('click', () => { void setPicked(url, title, false); });
            row.append(checkbox, link, filesta, remove);
            content.append(row);
        }
        }
        list.append(fragment);
    }

    function updatePickButton(button, active) {
        button.classList.toggle('efp-active', active);
        button.setAttribute('aria-pressed', String(active));
        button.title = active ? UI.remove : UI.add;
        button.setAttribute('aria-label', button.title);
    }

    function refreshButtons() {
        document.querySelectorAll('.efp-check-btn').forEach(button => {
            updatePickButton(button, Object.hasOwn(picked, button.dataset.url));
        });
        const detailButton = document.getElementById('efp-detail-btn');
        if (detailButton) {
            const active = Object.hasOwn(picked, detailButton.dataset.url);
            updatePickButton(detailButton, active);
            detailButton.querySelector('span').textContent = active ? UI.remove : UI.add;
        }
    }

    // Queue saves so rapid clicks cannot leave an older snapshot as the final stored value.
    let saveQueue = Promise.resolve();
    function setPicked(url, title, selected) {
        if (selected) {
            const exists = Object.hasOwn(picked,url);
            if(!exists) { undoState=null; collectionNotice=''; }
            picked[url] = title || url;
        }
        else { rememberUndo(); delete picked[url]; delete folderState.assignments[url]; selectedUrls.delete(url); }
        renderList();
        refreshButtons();
        return saveCollection();
    }

    function buildPanel() {
        if (document.getElementById('efp-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'efp-panel';
        panel.lang = UI_LANG;
        panel.setAttribute('translate', 'no');
        const drawer = document.createElement('div');
        drawer.id = 'efp-drawer';
        const header = document.createElement('div');
        header.id = 'efp-drawer-header';
        const label = document.createElement('span');
        label.className = 'efp-drawer-title';
        label.textContent = UI.shortTitle;
        const actions = document.createElement('div');
        actions.className = 'efp-header-actions';
        const copy = makeButton('efp-copy-btn', UI.copy, ICON_COPY);
        const clear = makeButton('efp-clear-btn', UI.clear, ICON_TRASH);
        const filesta = makeButton('efp-filesta-btn', UI.queue, ICON_DOWNLOAD);
        filesta.addEventListener('click', revealDownloads);
        const view = makeButton('efp-view-btn', UI.showThumbnails, ICON_GRID);
        view.addEventListener('click', () => {
            viewMode = viewMode === 'list' ? 'grid' : 'list';
            renderList();
            saveQueue = saveQueue.catch(() => {}).then(() => GM.setValue(VIEW_KEY, viewMode));
            saveQueue.catch(error => console.error('[EFP] Failed to save view:', error));
        });
        actions.append(view, copy);
        header.append(label, actions);
        const list = document.createElement('div');
        list.id = 'efp-list';
        const downloadAll = makeButton('efp-download-all',UI.downloadVisible,ICON_DOWNLOAD);
        downloadAll.addEventListener('click', () => { void startWebDownloads(actionEntries()); });
        const downloads = document.createElement('section'); downloads.id = 'efp-downloads'; downloads.hidden = true;
        const downloadsTitle = document.createElement('strong'); downloadsTitle.textContent = UI.queue;
        const downloadsHeading=document.createElement('div');downloadsHeading.id='efp-downloads-heading';
        const hideDownloads=makeButton('efp-hide-downloads',UI.hideDownloads,ICON_REMOVE);
        hideDownloads.addEventListener('click',()=>{downloads.hidden=true;});
        downloadsHeading.append(downloadsTitle,hideDownloads);
        const message = document.createElement('p'); message.id = 'efp-download-message'; message.setAttribute('role', 'status');
        const downloadList = document.createElement('div'); downloadList.id = 'efp-download-list';
        const stop = document.createElement('button'); stop.type = 'button'; stop.id = 'efp-download-stop'; stop.textContent = UI.stop;
        stop.addEventListener('click', async () => {
            if (!activeBatch) return;
            try { await GM.setValue(WEB_JOB_PREFIX + activeBatch.id + '_stop', true); stop.disabled = true; }
            catch { queueNotice = UI.storageError; renderWebDownloads(); }
        });
        const resume = document.createElement('button'); resume.type = 'button'; resume.id = 'efp-download-resume'; resume.textContent = UI.resume;
        resume.addEventListener('click', async () => {
            if (!activeBatch || typeof GM_openInTab !== 'function' || startingBatch) return;
            startingBatch = true;
            try {
                await GM.setValue(WEB_JOB_PREFIX + activeBatch.id + '_stop', false);
                workerTab?.close();
                workerTab = GM_openInTab(WEB_WORKER_URL + '#efp-job=' + activeBatch.id, { active: false, insert: true, setParent: true });
            } catch { queueNotice = UI.storageError; renderWebDownloads(); }
            finally { startingBatch = false; }
        });
        const cancel = document.createElement('button'); cancel.type = 'button'; cancel.id = 'efp-download-cancel'; cancel.textContent = UI.cancelRemaining;
        cancel.addEventListener('click', async () => {
            if (!activeBatch || !['paused', 'blocked'].includes(activeBatch.state)) return;
            try {
                activeBatch.items.filter(i => i.status === 'queued').forEach(i => { i.status = 'cancelled'; });
                await GM.setValue(WEB_JOB_PREFIX + activeBatch.id, activeBatch); renderWebDownloads();
            } catch { queueNotice = UI.storageError; renderWebDownloads(); }
        });
        const workerLink = document.createElement('a'); workerLink.id = 'efp-worker-link'; workerLink.textContent = UI.workerLink; workerLink.target = '_blank'; workerLink.rel = 'noopener noreferrer';
        downloads.append(downloadsHeading, message, downloadList, stop, resume, cancel, workerLink);
        const notice=document.createElement('div'); notice.id='efp-notice'; notice.hidden=true;
        const noticeText=document.createElement('span'); noticeText.id='efp-notice-text'; noticeText.setAttribute('role','status');
        const undo=makeButton('efp-undo',UI.undo,ICON_UNDO);
        undo.addEventListener('click',()=>{ if(!undoState)return; picked=undoState.picked;folderState=undoState.folderState;undoState=null;collectionNotice='';selectedUrls.clear();finishCollectionChange(); });
        notice.append(noticeText,undo);
        const collectionTools=buildCollectionTools();
        const more=makeButton('efp-more-btn',UI.more,ICON_MORE); more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls','efp-more-actions');
        const advanced=collectionTools.querySelector('#efp-more-actions');
        const closeMore=()=>{advanced.hidden=true;more.setAttribute('aria-expanded','false');};
        more.addEventListener('click',()=>{advanced.hidden=!advanced.hidden;more.setAttribute('aria-expanded',String(!advanced.hidden));});
        for(const [button,text] of [[filesta,UI.queue],[clear,UI.clear]]) { const span=document.createElement('span');span.textContent=text;button.append(span);button.classList.remove('efp-icon-btn');advanced.append(button); }
        advanced.addEventListener('click',event=>{if(event.target.closest('button'))closeMore();});
        panel.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!advanced.hidden){closeMore();more.focus();}else if(panel.classList.contains('efp-fullscreen'))setFullscreen(false);else closeDrawer();event.stopPropagation();}});
        document.addEventListener('pointerdown',event=>{if(!advanced.hidden&&!advanced.contains(event.target)&&!more.contains(event.target))closeMore();});
        const expandIcon=icon('<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>');
        const collapseIcon=icon('<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>');
        const fullscreen=makeButton('efp-fullscreen-btn',UI.fullscreen,expandIcon);
        fullscreen.setAttribute('aria-pressed','false');
        let pageOverflow=null;
        function setFullscreen(value) {
            if(value && !panel.classList.contains('efp-fullscreen')) { pageOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden'; }
            if(!value && pageOverflow!==null) {document.documentElement.style.overflow=pageOverflow;pageOverflow=null;}
            panel.classList.toggle('efp-fullscreen',value);
            fullscreen.innerHTML=value?collapseIcon:expandIcon;
            fullscreen.title=value?UI.exitFullscreen:UI.fullscreen;
            fullscreen.setAttribute('aria-label',fullscreen.title);fullscreen.setAttribute('aria-pressed',String(value));
        }
        fullscreen.addEventListener('click',()=>setFullscreen(!panel.classList.contains('efp-fullscreen')));
        actions.append(collectionTools.querySelector('#efp-export-html'),downloadAll,fullscreen,more);
        drawer.append(header, collectionTools, list, notice, downloads);
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.id = 'efp-toggle';
        toggle.title = UI.picked;
        toggle.setAttribute('aria-label', UI.toggle);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = ICON_CLAPPER + '<span id="efp-count" class="efp-empty">0</span>';
        panel.append(drawer, toggle);
        document.body.append(panel);
        let hideTimer, pointerInside=false, keyboardInteraction=false;
        function cancelAutoHide() { clearTimeout(hideTimer); }
        function closeDrawer() {
            cancelAutoHide();setFullscreen(false);closeMore();drawer.classList.remove('efp-open');toggle.setAttribute('aria-expanded','false');
            list.querySelectorAll('.efp-list-item').forEach(row=>row.dispatchEvent(new Event('mouseleave')));
        }
        function scheduleAutoHide() {
            cancelAutoHide();
            if(!matchMedia('(hover:hover)').matches || pointerInside || !drawer.classList.contains('efp-open'))return;
            hideTimer=setTimeout(()=>{
                const active=document.activeElement;
                const editing=active?.matches('input:not([type=checkbox]):not([type=file]),textarea') && panel.contains(active);
                if(editing || (keyboardInteraction && panel.contains(active)))return;
                if(!pointerInside)closeDrawer();
            },4000);
        }
        panel.addEventListener('pointerenter',()=>{pointerInside=true;cancelAutoHide();});
        panel.addEventListener('pointerleave',()=>{pointerInside=false;scheduleAutoHide();});
        panel.addEventListener('pointerdown',()=>{keyboardInteraction=false;});
        panel.addEventListener('keydown',()=>{keyboardInteraction=true;cancelAutoHide();});
        panel.addEventListener('focusout',()=>{queueMicrotask(scheduleAutoHide);});
        new MutationObserver(scheduleAutoHide).observe(drawer,{attributes:true,attributeFilter:['class']});
        toggle.addEventListener('click', () => {
            if(drawer.classList.contains('efp-open'))closeDrawer();
            else {drawer.classList.add('efp-open');toggle.setAttribute('aria-expanded','true');scheduleAutoHide();}
        });
        copy.addEventListener('click', () => {
            const urls = actionEntries().map(([url])=>url);
            if (!urls.length) return;
            try {
                GM_setClipboard(urls.join('\n'), 'text');
                copy.innerHTML = ICON_COPY_OK;
                copy.classList.add('efp-copied');
                copy.title = UI.copied;
                copy.setAttribute('aria-label', UI.copied);
                setTimeout(() => {
                    copy.innerHTML = ICON_COPY;
                    copy.classList.remove('efp-copied');
                    copy.title = UI.copy;
                    copy.setAttribute('aria-label', UI.copy);
                }, 2000);
            } catch (error) { console.error('[EFP] Clipboard error:', error); }
        });
        clear.addEventListener('click', () => {
            if (Object.keys(picked).length && window.confirm(UI.confirmClear)) {
                rememberUndo();
                picked = {};
                folderState.assignments={}; selectedUrls.clear(); finishCollectionChange();
            }
        });
        renderList();
        renderWebDownloads();
    }

    function findCardLink(card) {
        return card.querySelector('a[data-testid="title-link"][href]') ||
            card.querySelector('a[href*="elements.envato.com/"]') ||
            card.querySelector('a[href^="/"]:not([href^="//"])');
    }

    function findVideoSource(container) {
        const video = container.querySelector('video');
        const source = video?.currentSrc || video?.getAttribute('src') ||
            video?.querySelector('source[src]')?.getAttribute('src') ||
            container.querySelector('meta[property="og:video:secure_url"],meta[property="og:video:url"],meta[property="og:video"]')?.content;
        if (!source) return null;
        try {
            const url = new URL(source, BASE_URL);
            return /^https?:$/.test(url.protocol) ? url.href : null;
        } catch { return null; }
    }

    function captureThumbnail(container, url) {
        const source = container.querySelector('video[poster]')?.poster ||
            container.querySelector('img')?.currentSrc || container.querySelector('img')?.src;
        const videoSource = findVideoSource(container);
        let changed = false;
        if (source && /^https?:\/\//.test(source) && thumbnails[url] !== source) {
            thumbnails[url] = source;
            changed = true;
        }
        if (videoSource && videos[url] !== videoSource) {
            videos[url] = videoSource;
            changed = true;
        }
        if (changed && Object.hasOwn(picked, url)) void setPicked(url, picked[url], true);
    }

    async function loadVideoPreview(url) {
        if (videos[url]) return videos[url];
        if (Date.now() - (previewFailures.get(url) || 0) < 30000) return null;
        if (!previewRequests.has(url)) {
            const request = (async () => {
                const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
                if (!response.ok) return null;
                const page = new DOMParser().parseFromString(await response.text(), 'text/html');
                const source = findVideoSource(page);
                if (source && Object.hasOwn(picked, url)) {
                    videos[url] = source;
                    const snapshot = { ...videos };
                    saveQueue = saveQueue.catch(() => {}).then(() => GM.setValue(VIDEOS_KEY, snapshot));
                    saveQueue.catch(error => console.error('[EFP] Failed to save video preview:', error));
                }
                return source;
            })().catch(() => null);
            previewRequests.set(url, request);
            request.then(source=>{if(!source)previewFailures.set(url,Date.now());}).finally(() => previewRequests.delete(url));
        }
        return previewRequests.get(url);
    }

    function attachVideoPreview(row, preview, url) {
        let video;
        let hovered = false;
        row.addEventListener('mouseenter', async () => {
            hovered = true;
            const source = await loadVideoPreview(url);
            if (!source || !hovered || !row.isConnected) return;
            if (!video) {
                video = document.createElement('video');
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.preload = 'none';
                video.width = 320; video.height = 180;
                video.src = source;
                video.addEventListener('error', () => { video.hidden = true; });
                preview.append(video);
            }
            video.hidden = false;
            video.play().catch(() => { video.hidden = true; });
        });
        const stop = () => {
            hovered = false;
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.hidden = true;
            }
        };
        row.addEventListener('mouseleave', stop);
        preview.title = UI.previewHint;
    }

    function injectButton(card) {
        const titleLink = findCardLink(card);
        if (!titleLink) return;
        const url = canonicalUrl(titleLink.href);
        if (!url || new URL(url).pathname === '/') return;
        captureThumbnail(card, url);
        const title = titleLink.textContent.trim() || titleLink.getAttribute('aria-label') || url;
        const videoArea = card.querySelector('.dc9DIUal') || card.querySelector('video')?.parentElement || card;
        let button = card.querySelector('.efp-check-btn');
        if (button && button.parentElement !== videoArea) button.remove();
        if (!button || !button.isConnected) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'efp-check-btn';
            button.setAttribute('translate', 'no');
            button.innerHTML = CHECK_ICON;
            for (const eventName of ['pointerdown', 'mousedown', 'mouseup']) {
                button.addEventListener(eventName, event => event.stopPropagation());
            }
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                const currentUrl = button.dataset.url;
                void setPicked(currentUrl, button.dataset.title, !Object.hasOwn(picked, currentUrl));
            });
            videoArea.append(button);
        }
        if (getComputedStyle(videoArea).position === 'static') videoArea.style.position = 'relative';
        button.dataset.url = url;
        button.dataset.title = title;
        updatePickButton(button, Object.hasOwn(picked, url));
    }

    const DETAIL_ACTION_SELECTOR = '[data-testid="button-add-to-collection"], [data-testid="button-add-to-workspace"], [data-testid="button-download-preview"]';
    function injectDetailPageButtons() {
        const detailPage = document.querySelector(DETAIL_SELECTOR);
        const oldActions = document.getElementById('efp-detail-actions');
        if (!detailPage) { oldActions?.remove(); return; }
        const titleEl = detailPage.querySelector('h1');
        // Signed-in accounts use Workspace; guests use Collection. Preview is a stable fallback.
        const anchor = detailPage.querySelector('[data-testid="button-add-to-collection"], [data-testid="button-add-to-workspace"]') ||
            detailPage.querySelector('[data-testid="button-download-preview"]');
        if (!titleEl || !anchor?.parentElement) { oldActions?.remove(); return; }
        const url = canonicalUrl(location.href);
        if (!url) return;
        captureThumbnail(detailPage, url);
        const title = titleEl.textContent.trim() || url;
        let actions = oldActions;
        if (!actions || actions.parentElement !== anchor.parentElement) {
            actions?.remove();
            actions = document.createElement('div');
            actions.id = 'efp-detail-actions';
            actions.lang = UI_LANG;
            actions.setAttribute('translate', 'no');
            const pick = document.createElement('button');
            pick.type = 'button';
            pick.id = 'efp-detail-btn';
            pick.innerHTML = CHECK_ICON + '<span></span>';
            pick.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                void setPicked(pick.dataset.url, pick.dataset.title, !Object.hasOwn(picked, pick.dataset.url));
            });
            actions.append(pick);
            const download = document.createElement('button');
            download.type = 'button'; download.id = 'efp-filesta-download';
            download.innerHTML = ICON_DOWNLOAD + '<span></span>';
            download.querySelector('span').textContent = UI.download;
            download.title = UI.download; download.setAttribute('aria-label', UI.download);
            download.addEventListener('click', event => {
                event.preventDefault(); event.stopPropagation();
                void startWebDownloads([[pick.dataset.url, pick.dataset.title]]);
            });
            actions.append(download);
            anchor.parentElement.append(actions);
        }
        const pick = actions.querySelector('#efp-detail-btn');
        pick.dataset.url = url;
        pick.dataset.title = title;
        refreshButtons();
    }

    function scanPage() {
        if (!document.body) return;
        buildPanel();
        document.querySelectorAll(CARD_SELECTOR).forEach(injectButton);
        injectDetailPageButtons();
    }

    let scanTimer;
    function scheduleScan() {
        clearTimeout(scanTimer);
        scanTimer = setTimeout(scanPage, 180);
    }

    if (!document.body) {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }
    scanPage();

    const observer = new MutationObserver(mutations => {
        if (mutations.some(mutation => {
            if (mutation.target.closest?.('#efp-panel,#efp-detail-actions')) return false;
            if (mutation.type === 'attributes') return Boolean(mutation.target.closest?.(CARD_SELECTOR + ',' + DETAIL_SELECTOR));
            return [...mutation.addedNodes, ...mutation.removedNodes].some(node =>
                node.nodeType === Node.ELEMENT_NODE &&
                (node.matches?.(CARD_SELECTOR + ',' + DETAIL_SELECTOR) ||
                 node.querySelector?.(CARD_SELECTOR + ',' + DETAIL_SELECTOR) ||
                 node.matches?.('main,h1,' + DETAIL_ACTION_SELECTOR) || node.querySelector?.(DETAIL_ACTION_SELECTOR))
            );
        })) scheduleScan();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href', 'src', 'srcset', 'poster'],
    });
    if (window.onurlchange === null) window.addEventListener('urlchange', scheduleScan);
    setInterval(() => { void pollWebDownloads(); }, 2000);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('#efp-list .efp-list-item').forEach(row=>row.dispatchEvent(new Event('mouseleave')));});
    console.log('[EFP] Envato Footage Picker 1.0.78 loaded · ' + UI_LANG);
})();
