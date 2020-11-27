const electron = require("electron");
let fs = require("fs");
//start the app
const { app, BrowserWindow, Menu, ipcMain, dialog } = electron;

// you have to do this declaraiton for scoping issues
let mainWindow;
let addWindow;
let helpWindow;

// watch the app object and wait for a ready event
app.on("ready", () => {
  // function to run when the app is ready
  // create browser window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // instruct main window to load html file, from the file system not http:
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.maximize();
  // quit app and close addWindow if main window is closed
  mainWindow.on("closed", () => app.quit());
  // attach menu
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

//When you click on create file cab
function createFileCabinet() {
  addWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: "Create New File Cabinet",
    parent: mainWindow,
    modal: true,
    show: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  addWindow.setMenu(null);
  addWindow.loadURL(`file://${__dirname}/add.html`);
  // the following is for garbage collection
  addWindow.on("closed", () => {
    addWindow = null;
  });
}
//When you click on help
function loadHelp() {
  helpWindow = new BrowserWindow({
    width: 800,
    height: 800,
    title: "Help",
  });
  helpWindow.setMenu(null);
  helpWindow.loadURL(`file://${__dirname}/help.html`);
  helpWindow.maximize();
  // the following is for garbage collection
  helpWindow.on("closed", () => {
    helpWindow = null;
  });
}

//When You click on load file cab
function loadFileCabinet() {
  // this is for extsions
  let myOptions = {
    filters: [
      {
        name: "Custom File Type",
        extensions: ["debx"],
      },
    ],
    properties: ["openFile", "multiSelections"],
  };
  dialog.showOpenDialog(null, myOptions, (fileNames) => {
    if (!fileNames) {
      let message = "No file selected!";
      let msgType = "error";
      mainWindow.webContents.send("Display:showAlert", { message, msgType });
    } else {
      // readFileContents(fileNames[0]);
      fileNames.forEach((file) => readFileContents(file));
    }
  });

  function readFileContents(filepath) {
    if (!filepath) {
      let message = "No file selected!";
      let msgType = "error";
      mainWindow.webContents.send("Display:showAlert", { message, msgType });
      return;
    }

    fs.readFile(filepath, "utf-8", (err, data) => {
      if (err) {
        let message = "An error occured reading the file!";
        let msgType = "error";
        mainWindow.webContents.send("Display:showAlert", { message, msgType });
        return;
      } else {
        try {
          data = JSON.parse(data);
        } catch {
          let message = "Can not parse data!";
          let msgType = "error";
          mainWindow.webContents.send("Display:showAlert", {
            message,
            msgType,
          });
          return;
        }

        if (data) {
          if (data.fileType === "ElectronFileCab2020November") {
            // set filepath: This is in case you moved your file
            data.fileNamePath = filepath;
            // laod file cab
            // data is an object to be converted to an file cab object
            mainWindow.webContents.send("fileCab:load", data);
          } else {
            let message =
              "This is not a valid ElectronFileCab2020November file!";
            let msgType = "error";
            mainWindow.webContents.send("Display:showAlert", {
              message,
              msgType,
            });
          }
        }
      }
    });
  }
} // End readFileContents(filepath)

function setDeleteModeFalse() {
  let deleteMode = false;
  mainWindow.webContents.send("deleteMode:set", deleteMode);
} // End setDeleteModeFalse()

function setDeleteModeTrue() {
  let deleteMode = true;
  mainWindow.webContents.send("deleteMode:set", deleteMode);
} // End setDeleteModeTrue()

function setThemeLight() {
  let myThemeString = "Light";
  mainWindow.webContents.send("Theme:set", myThemeString);
} // End setThemeLight()

function setThemeDark() {
  let myThemeString = "Dark";
  mainWindow.webContents.send("Theme:set", myThemeString);
} // End setThemeDark()

function showSettingsForm() {
  mainWindow.webContents.send("SettingsForm:show");
} // End showSettingsForm()

function setFontSize(fontSize) {
  mainWindow.webContents.send("FontSize:change", fontSize);
} // End setFontSize(fontSize)

function closeSelectedFileCab() {
  mainWindow.webContents.send("FileCab:close");
} // End closeSelectedFileCab()

function closeAllFileCabs() {
  mainWindow.webContents.send("FileCab:closeAll");
} // End closeAllFileCabs()

// this listens for the addWindow
ipcMain.on("fileCab:add", (event, name) => {
  // close the addWindow
  addWindow.close();
  // Set fileName to name
  // filter for .debx extensions
  let myOptions = {
    defaultPath: name,
    filters: [{ name: "Custom File Type", extensions: ["debx"] }],
  };
  // open save dialog to create a fileNamePath
  dialog.showSaveDialog(null, myOptions, (fileNamePath) => {
    // send all info in an object to script.js
    mainWindow.webContents.send("fileCab:add", { fileNamePath, name });
  });
}); // End ipcMain.on("fileCab:add"

// this listens for the addWindow cancel btn
ipcMain.on("addForm:cancel", (event) => {
  addWindow.close();
}); // End ipcMain.on("addForm:cancel"

// Top Menu
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Create File Cabinet",
        accelerator: process.platform === "darwin" ? "Command+N" : "Ctrl+N",
        click() {
          createFileCabinet();
        },
      },
      {
        label: "Load File Cabinet",
        accelerator: process.platform === "darwin" ? "Command+O" : "Ctrl+O",
        click() {
          loadFileCabinet();
        },
      },
      {
        label: "Close Selected Cabinet",
        accelerator: process.platform === "darwin" ? "Command+O" : "Ctrl+8",
        click() {
          closeSelectedFileCab();
        },
      },
      {
        label: "CLose All Cabinet's",
        accelerator: process.platform === "darwin" ? "Command+O" : "Ctrl+9",
        click() {
          closeAllFileCabs();
        },
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Mode",
    submenu: [
      {
        label: "Read and Write",
        accelerator: process.platform === "darwin" ? "Command+L" : "Ctrl+L",
        click() {
          setDeleteModeFalse();
        },
      },
      {
        label: "Edit and Delete",
        accelerator: process.platform === "darwin" ? "Command+D" : "Ctrl+D",
        click() {
          setDeleteModeTrue();
        },
      },
    ],
  },
  {
    label: "Settings",
    submenu: [
      {
        label: "Font-size: x-small",
        accelerator: process.platform === "darwin" ? "Command+1" : "Ctrl+1",
        click() {
          setFontSize("x-small");
        },
      },
      {
        label: "Font-size: small",
        accelerator: process.platform === "darwin" ? "Command+2" : "Ctrl+2",
        click() {
          setFontSize("small");
        },
      },
      {
        label: "Font-size: normal",
        accelerator: process.platform === "darwin" ? "Command+3" : "Ctrl+3",
        click() {
          setFontSize("normal");
        },
      },
      {
        label: "Font-size: large",
        accelerator: process.platform === "darwin" ? "Command+4" : "Ctrl+4",
        click() {
          setFontSize("large");
        },
      },
      {
        label: "Font-size: x-large",
        accelerator: process.platform === "darwin" ? "Command+5" : "Ctrl+5",
        click() {
          setFontSize("x-large");
        },
      },
      {
        label: "Light Theme",
        accelerator: process.platform === "darwin" ? "Command+L" : "Ctrl+6",
        click() {
          setThemeLight();
        },
      },
      {
        label: "Dark Theme",
        accelerator: process.platform === "darwin" ? "Command+D" : "Ctrl+7",
        click() {
          setThemeDark();
        },
      },
      {
        label: "Start Up Settings Form",
        accelerator: process.platform === "darwin" ? "Command+L" : "Ctrl+S",
        click() {
          showSettingsForm();
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Help",
        accelerator: process.platform === "darwin" ? "Command+D" : "Ctrl+h",
        click() {
          loadHelp();
        },
      },
    ],
  },
]; // End menuTemplate

//Check for mac os
if (process.platform === "darwin") {
  //add empty object to the front of the array
  menuTemplate.unshift({});
}

//check for NODE_ENV => prodution, development, staging, test
//This does not work comment it out before you build

//DEVELOPER TOOLS
// if (process.env.NODE_ENV !== "production") {
//   // add object to end of array menu
//   menuTemplate.push({
//     label: "View",
//     submenu: [
//       //predefined role
//       { role: "reload" },
//       {
//         label: "Toggle Developer Tools",
//         accelerator:
//           process.platform === "darwin" ? "Command+Alt+I" : "Ctrl+Shift+I",
//         click(item, focusedWindow) {
//           focusedWindow.toggleDevTools();
//         },
//       },
//     ],
//   });
// }
