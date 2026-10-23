const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('typewriter', {
  recordsDir: () => ipcRenderer.invoke('records-dir'), configGet: () => ipcRenderer.invoke('config-get'), configSet: v => ipcRenderer.invoke('config-set',v),
  readPlan: p => ipcRenderer.invoke('read-plan',p), saveImport: v => ipcRenderer.invoke('save-import',v), readSidecar: p => ipcRenderer.invoke('read-sidecar',p),
  saveProgress: v => ipcRenderer.invoke('save-progress',v), appendNote: v => ipcRenderer.invoke('append-note',v), deletePlan: p => ipcRenderer.invoke('delete-plan',p),
  listPlans: () => ipcRenderer.invoke('list-plans'), chooseImport: () => ipcRenderer.invoke('choose-import'), resize: h => ipcRenderer.send('resize',h)
});
