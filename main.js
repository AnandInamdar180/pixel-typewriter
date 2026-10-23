const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

// Optional first-run input. The chosen directory is then persisted in userData/config.json.
const initialRecordsDir = process.env.TYPEWRITER_RECORDS_DIR || null;
const configPath = () => path.join(app.getPath('userData'), 'config.json');
let win;
// 13-inch Mac displays benefit from a modest enlargement while preserving the pixel grid.
const UI_SCALE = 1.3;
const FOCUSED_HEIGHT = 720;
function safeJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function inRecords(p) { const rootDir = config().recordsDir; if (!rootDir || !p) return false; const root = path.resolve(rootDir) + path.sep; return path.resolve(p).startsWith(root); }
function unique(file) { let out = file, n = 1; const ext = path.extname(file), base = file.slice(0, -ext.length); while (fs.existsSync(out)) out = `${base}-${Date.now()}${n++ > 1 ? '-' + n : ''}${ext}`; return out; }
function config() { return safeJson(configPath(), { recordsDir: initialRecordsDir, activePlan: null }); }
function setConfig(next) { fs.mkdirSync(app.getPath('userData'), { recursive: true }); fs.writeFileSync(configPath(), JSON.stringify({ ...config(), ...next }, null, 2)); }
function taskLineEdit(markdown, index, done) {
  let count = -1;
  return markdown.split(/\r?\n/).map(line => {
    if (!/^\s*-\s*\[[ xX]\]/.test(line)) return line;
    count++; if (count !== index) return line;
    const clean = line.replace(/\s*\(done \d{4}-\d\d-\d\d \d\d:\d\d\)\s*$/, '');
    return done ? clean.replace(/\[[ xX]\]/, '[x]') + ` (done ${new Date().toISOString().slice(0,16).replace('T',' ')})` : clean.replace(/\[[xX]\]/, '[ ]');
  }).join('\n');
}
function planSidecar(p) { return p.replace(/\.md$/i, '') + '.progress.json'; }
function planSummary(planPath) {
  const text = fs.readFileSync(planPath, 'utf8');
  const title = (text.match(/^#\s+(.+)$/m) || [null, path.basename(planPath, '.md')])[1].trim();
  const taskCount = (text.match(/^\s*-\s*\[[ xX]\]/gm) || []).length;
  const sidecar = safeJson(planSidecar(planPath), null);
  const tasks = Array.isArray(sidecar?.tasks) && sidecar.tasks.length === taskCount ? sidecar.tasks : null;
  const doneCount = tasks ? tasks.filter(task => task.done).length : (text.match(/^\s*-\s*\[[xX]\]/gm) || []).length;
  return { path: planPath, title, taskCount, doneCount };
}
ipcMain.handle('records-dir', () => config().recordsDir);
ipcMain.handle('config-get', () => config());
ipcMain.handle('config-set', (_, v) => { setConfig(v); return config(); });
ipcMain.handle('read-plan', (_, p) => { try { return inRecords(p) ? fs.readFileSync(p, 'utf8') : null; } catch { return null; } });
ipcMain.handle('save-import', (_, { text, sourceName }) => { try { const dir = config().recordsDir; if (!dir) return null; fs.mkdirSync(dir, {recursive:true}); let name = sourceName || 'plan.md'; if (!name.endsWith('.md')) name += '.md'; const dest = unique(path.join(dir, path.basename(name))); fs.writeFileSync(dest, text, 'utf8'); return dest; } catch { return null; } });
ipcMain.handle('save-progress', (_, { plan, progress, taskIndex, done }) => { try { if (!inRecords(plan)) return false; fs.writeFileSync(plan, taskLineEdit(fs.readFileSync(plan,'utf8'), taskIndex, done), 'utf8'); fs.writeFileSync(planSidecar(plan), JSON.stringify({ storedPlanPath: plan, taskIndices: progress.map((_, i) => i), tasks: progress }, null, 2)); return true; } catch { return false; } });
ipcMain.handle('append-note', (_, { plan, note }) => { try { if (!inRecords(plan)) return false; if (note.trim()) fs.appendFileSync(plan, `\n\n---\n**session note (${new Date().toISOString().slice(0,16).replace('T',' ')}):** ${note.trim()}\n`); return true; } catch { return false; } });
ipcMain.handle('delete-plan', (_, plan) => { try { if (!inRecords(plan)) return false; fs.rmSync(plan, {force:true}); fs.rmSync(planSidecar(plan), {force:true}); return true; } catch { return false; } });
ipcMain.handle('read-sidecar', (_, p) => safeJson(planSidecar(p), null));
ipcMain.handle('list-plans', () => {
  try {
    const recordsDir = config().recordsDir;
    if (!recordsDir || !fs.existsSync(recordsDir)) return [];
    return fs.readdirSync(recordsDir, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
      .map(entry => path.join(recordsDir, entry.name))
      .filter(inRecords)
      .map(planSummary)
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch { return []; }
});
ipcMain.handle('choose-import', async () => {
  const result = await dialog.showOpenDialog(win, { title: 'Import Typewriter plan', properties: ['openFile'], filters: [{ name: 'Markdown plans', extensions: ['md'] }] });
  if (result.canceled || !result.filePaths[0]) return null;
  try { const filePath = result.filePaths[0]; return { text: fs.readFileSync(filePath, 'utf8'), sourceName: path.basename(filePath) }; } catch { return null; }
});
ipcMain.on('resize', (_, cssHeight) => {
  if (!win) return;
  const maxHeight = screen.getDisplayMatching(win.getBounds()).workAreaSize.height - 40;
  win.setSize(Math.round(420 * UI_SCALE), Math.min(Math.round(cssHeight * UI_SCALE), maxHeight));
});
function createWindow() {
  win = new BrowserWindow({ width:Math.round(420 * UI_SCALE), height:Math.round(FOCUSED_HEIGHT * UI_SCALE), resizable:false, frame:false, transparent:true, alwaysOnTop:true, webPreferences:{ contextIsolation:true, nodeIntegration:false, preload:path.join(__dirname,'preload.js') } });
  win.loadFile('index.html');
}
app.setName('Typewriter');
app.whenReady().then(() => { if (!safeJson(configPath()) && initialRecordsDir) setConfig({ recordsDir: initialRecordsDir }); createWindow(); }); app.on('window-all-closed', () => app.quit());
