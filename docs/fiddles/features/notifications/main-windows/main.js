const { app, BrowserWindow, Notification } = require('electron');
const { platform } = require('process');

let window = null;
app.setAsDefaultProtocolClient('my-electron-app');
const isPrimary = app.requestSingleInstanceLock();

app.on('ready', async () => {
  if (!isPrimary) {
    /* We are currently running this code in a second instance. We need to quit the process. */
    app.quit();
  }

  window = createWindow();
  await window.loadFile('index.html');

  showNotification();
});

if (platform === 'win32') {
  app.setAppUserModelId('com.electron.myapp');
}

app.on('second-instance', (_event, argv) => {
  if (!window || window.isDestroyed()) {
    return;
  }
  const lastArg = argv[argv.length - 1];
  if (lastArg) {
    window.webContents.send('handle-uri', lastArg);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function createWindow () {
  return new BrowserWindow({
    width: 800,
    height: 600
  });
}

const NOTIFICATION_TITLE = 'Basic Notification';
const NOTIFICATION_BODY = 'Notification from the Main process';

function showNotification () {
  new Notification({
    toast: `<toast>
      <visual>
        <binding template="ToastText02">
          <text>${NOTIFICATION_TITLE}</text>
          <text>${NOTIFICATION_BODY}</text>
        </binding>
      </visual>
      <actions>
        <action content="Action 1" activationType="protocol" arguments="my-electron-app://action1" />
        <action content="Action 2" activationType="protocol" arguments="my-electron-app://action2" />
      </actions>
   </toast>`
  }).show();
}
