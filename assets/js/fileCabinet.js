class FileCabinet {
  constructor(name, fileNamePath, array = []) {
    this.name = name;
    this.fileNamePath = fileNamePath;
    this.mainFolderArray = array;
    this.fileType = "ElectronFileCab2020November";
  }
  // Method
  writeFileCabToHardDisk(fs, display) {
    try {
      // throw error("force an error");
      //Stringify the file cab Object
      const content = JSON.stringify(this);
      fs.writeFileSync(this.fileNamePath, content);
    } catch (err) {
      setTimeout(() => {
        display.showAlert(`Error writing file. ${err}`, "error", 5000);
      }, 5000);
    }
  } // End writeFileCabToHardDisk(fs)
} // End FileCabinet class
