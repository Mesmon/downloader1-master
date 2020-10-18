const electron = require("electron");
const fs = require("fs");
const moment = require("moment");
const needle = require("needle");
const url = require("url");
const path = require("path");
const { app, BrowserWindow, ipcMain } = electron;
const {dialog} = require("electron")

let mainWindow;
//creates the main window
app.on("ready", function () {
  mainWindow = new BrowserWindow({
    height: 250,
    width: 300,
    icon: "assests/icons/win/swiss3.ico",
    webPreferences: {
      nodeIntegration: true,
    },
  });
  //properties of the window
  // mainWindow.removeMenu();
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "home.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  //the request from the api
  // const download = (uri, filename) => {
  //   let out = fs.createWriteStream(filename);
  //   needle
  //     .get(uri, (error, res) => {
  //       if (!error && res.statusCode == 200) return res.body;
  //       else mainWindow.webContents.send("error1", error);
  //     })
  //     .pipe(out)
  //     .on("finish", function () {
  //       mainWindow.webContents.send("finishDownload", "whoooooooh!");
  //     })
  //     .on("error", function (err) {
  //       console.log("ERROR:" + err);
  //       mainWindow.webContents.send("error1", err);
  //       out.read();
  //     });
  // };

  const download = (uri, filename) => {
    needle
      .get(uri, (error, res) => {
        if (!error && res.statusCode == 200) 
        {
          let buffer = Buffer.from(res.body);

          let magic_num = buffer.toString('hex',0,4);
          if (magic_num != "89504e47")
          { 
            console.log(magic_num)
            console.log("invalid")
          }
          else
          {
            fs.writeFile(filename, buffer, function (err) {
              if (err) throw err;
              console.log('Saved!' + filename);
            });

            const options = {
              type: 'info',
              defaultId: 2,
              title: 'Success',
              message: 'Succesfully downloaded:',
              detail: filename,
              
            };
          
            dialog.showMessageBox(null, options, (response, checkboxChecked) => {
              console.log(response);
              console.log(checkboxChecked);
            });

          }  

        }
        else mainWindow.webContents.send("error1", error);
      })
      .on("finish", function () {
        mainWindow.webContents.send("finishDownload", "whoooooooh!");
      })
      .on("error", function (err) {
        console.log("ERROR:" + err);
        mainWindow.webContents.send("error1", err);
      });
  };

  //the from the user to the server
  ipcMain.on("item:add", (e, item) => {
    const desktop = path.join("D:\\Downloads\\downloader1-master\\", date);
    // item is the name from the form
    //triggres the request
    download(
      "http://www.pngmart.com/files/13/" + item,
      path.join(downloadPath(desktop), item.concat(".png"))
    );
  });

  //close it
  mainWindow.on("closed", function () {
    app.quit();
  });
});

//extras

//makes the path to download to
const date = moment().format("DD-MM-YYYY");
const downloadPath = (path1) => {
  if (!fs.existsSync(path1)) {
    fs.mkdirSync(path1);
  }
  return path1;
};
