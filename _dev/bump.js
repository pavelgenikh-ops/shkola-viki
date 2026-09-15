/* Обновить версию ресурсов в index.html, чтобы браузер не отдавал старые файлы из кеша.
   Запуск из папки приложения:  _dev\node.exe _dev\bump.js   */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'index.html');
let t = fs.readFileSync(file, 'utf8');
const v = Date.now().toString(36);
t = t.replace(/(src="(?:js\/[^"]+?))(?:\?v=[a-z0-9]+)?"/g, '$1?v=' + v + '"');
t = t.replace(/(href="css\/style\.css)(?:\?v=[a-z0-9]+)?"/, '$1?v=' + v + '"');
fs.writeFileSync(file, t);
console.log('Версия ресурсов обновлена: ' + v);
