const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('Envato-Elements-Footage-Picker.user.js', 'utf8');
function helpers() {
  const code = source.split('// COLLECTION_HELPERS_START')[1]?.split('// COLLECTION_HELPERS_END')[0] || '';
  const ctx = vm.createContext({ URL, navigator: {language:'ru'} });
  const translations = source.split('// Keep interface translations together; footage titles remain unchanged.')[1].split('const WEB_JOB_PREFIX')[0];
  vm.runInContext(translations, ctx);
  vm.runInContext(code, ctx);
  return ctx;
}
test('adaptive grid reserves 2x2 through 4x3 cells', () => {
  const h = helpers();
  for (const [n, columns, rows] of [[0,2,2],[4,2,2],[5,3,2],[6,3,2],[7,3,3],[9,3,3],[10,4,3],[99,4,3]]) {
    assert.equal(h.gridShape(n).columns, columns);
    assert.equal(h.gridShape(n).rows, rows);
  }
});
test('legacy collection gains folders without losing items; dangling assignments removed', () => {
  const h = helpers();
  const p = {'https://elements.envato.com/a-ABCDE12':'A'};
  const state = h.normalizeFolders({folders:[{id:'f1',name:' Test '}],assignments:{[Object.keys(p)[0]]:'f1',bad:'f1'}},p);
  assert.equal(state.folders[0].name,'Test');
  assert.deepEqual(Object.keys(state.assignments), Object.keys(p));
  assert.equal(h.normalizeFolders(null,p).folders.length,0);
});
test('HTML export escapes titles, omits unsafe images and links, contains no executable script', () => {
  const h=helpers(), url='https://elements.envato.com/a-ABCDE12';
  const html=h.collectionHTML('<Folder>',[[url,'<img src=x onerror=alert(1)>'],['javascript:alert(1)','bad']],{[url]:'javascript:alert(1)'});
  assert.match(html,/&lt;Folder&gt;/);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html,/javascript:|<script|<img src="javascript/);
  assert.match(html,/rel="noopener noreferrer"/);
});
test('backup validation is atomic and rejects malformed or unsupported data', () => {
  const h=helpers();
  assert.throws(()=>h.parseBackup('{'));
  assert.throws(()=>h.parseBackup('{"version":99,"picked":{}}'));
  assert.throws(()=>h.parseBackup('{"version":1,"picked":[]}'));
  const b=h.parseBackup(JSON.stringify({version:1,picked:{'https://elements.envato.com/a-ABCDE12?x=1':'A','https://evil.test/a':'bad'},thumbnails:{},videos:{}}));
  assert.deepEqual(Object.keys(b.picked),['https://elements.envato.com/a-ABCDE12']);
});
test('backup round trip keeps distinct folders with identical names and repeats without duplicates', () => {
  const h=helpers();
  const a='https://elements.envato.com/a-ABCDE12', b='https://elements.envato.com/b-ABCDE12';
  const backup={picked:{[a]:'A',[b]:'B'},thumbnails:{},videos:{},folders:[{id:'f1',name:'Project'},{id:'f2',name:'Project'}],assignments:{[a]:'f1',[b]:'f2'}};
  const empty={picked:{},thumbnails:{},videos:{},folderState:{folders:[],assignments:{}}};
  const result=h.mergeBackup(empty,backup,()=> 'new-id');
  assert.equal(result.folderState.folders.length,2);
  assert.notEqual(result.folderState.assignments[a],result.folderState.assignments[b]);
  assert.equal(h.mergeBackup(result,backup,()=> 'new-id').folderState.folders.length,2);
  const original={...result,picked:{...result.picked,[a]:'Manual title'}};
  assert.equal(h.mergeBackup(original,backup,()=> 'new-id').picked[a],'Manual title');
});
