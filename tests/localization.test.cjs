const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('Envato-Elements-Footage-Picker.user.js', 'utf8');
function load(navigator = {}) {
  const code = source.split('// Keep interface translations together; footage titles remain unchanged.')[1].split('const WEB_JOB_PREFIX')[0];
  const ctx = vm.createContext({ navigator, URL });
  vm.runInContext(code + '\nthis.translations = TRANSLATIONS; this.locale = UI_LANG; this.ui = UI;', ctx);
  const helpers = source.split('// COLLECTION_HELPERS_START')[1].split('// COLLECTION_HELPERS_END')[0];
  vm.runInContext(helpers, ctx);
  return ctx;
}
test('primary browser language chooses Russian regional variants or English fallback', () => {
  for (const tag of ['ru', 'ru-RU', 'ru-BY', 'RU-ru']) assert.equal(load({language:tag}).locale, 'ru');
  for (const tag of ['en-US', 'de-DE', '', undefined]) assert.equal(load({language:tag}).locale, 'en');
  assert.equal(load({languages:['en-US','ru-RU'],language:'ru-RU'}).locale, 'en');
  assert.equal(load({languages:['ru-RU','en-US']}).locale, 'ru');
  assert.equal(load({languages:[],language:'ru'}).locale, 'ru');
});
test('both dictionaries cover every UI reference with nonempty strings', () => {
  const h = load();
  assert.deepEqual(Object.keys(h.translations.en).sort(),Object.keys(h.translations.ru).sort());
  const keys = [...source.matchAll(/UI\.([a-zA-Z]+)/g)].map(m=>m[1]);
  for (const dict of Object.values(h.translations)) {
    for (const key of keys) assert.equal(typeof dict[key], 'string', key);
    for (const value of Object.values(dict)) assert.ok(value.length > 0);
  }
  assert.equal(h.ui.shortTitle, 'Collection');
  assert.equal(load({language:'ru'}).ui.shortTitle, 'Подборка');
});
test('HTML export follows selected language and keeps original footage titles', () => {
  for (const [language, placeholder] of [['ru','Нет превью'],['en','No preview']]) {
    const h=load({language});
    const html=h.collectionHTML('Folder', [['https://elements.envato.com/a-ABCDE12','Original Title']],{});
    assert.match(html,new RegExp('lang="'+language+'"'));
    assert.ok(html.includes(placeholder));
    assert.ok(html.includes('Original Title'));
  }
});
