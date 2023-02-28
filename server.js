const url = "https://" + process.env.SERVICE_URL;
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", function (req, res) {
  res.send("hello world");
});

app.get("/start", function (req, res) {
  let cmdStr = "[ -e entrypoint.sh ] && bash entrypoint.sh; chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Web start error：" + err);
    }
    else {
      res.send("Web start success!");
    }
  });
});

// keepalive begin
function keepalive() {
  exec("curl -m8 " + url + ":" + port, function (err, stdout, stderr) {
    if (err) {
      console.log("Keepalive error： " + err);
    } else {
      console.log("Keepalive success, response:" + stdout);
    }
  });

  exec("pgrep -laf web.js", function (err, stdout, stderr) {
    if (stdout.includes("./web.js -c ./config.json")) {
      console.log("Web service is working");
    }
    else {
      exec(
        "chmod +x web.js && ./web.js -c ./config.json >/dev/null 2>&1 &", function (err, stdout, stderr) {
          if (err) {
            console.log("Keepalive restart error:" + err);
          }
          else {
            console.log("Keepalive restart success!");
          }
        }
      );
    }
  });
}
setInterval(keepalive, 10 * 1000);

app.get("/download", function (req, res) {
  download_web((err) => {
    if (err) {
      res.send("web.js downloaded successfully!");
    }
    else {
      res.send("web.js download failed: " + err);
    }
  });
});

app.use(
  "/",
  createProxyMiddleware({
    changeOrigin: true,
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
    pathRewrite: {
      "^/": "/"
    },
    target: "http://127.0.0.1:8080/",
    ws: true
  })
);

function download_web(callback) {
  let fileName = "web.js";
  let web_url =
    "https://github.com/fscarmen2/Argo-X-Container-PaaS/raw/main/web.js";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) {
        callback("Failed to download web.js: " + err);
      }
      else {
        callback(null);
      }
    });
}

download_web((err) => {
  if (err) {
    console.log("Failed to download web.js: " + err);
  }
  else {
    console.log("web.js downloaded successfully!");
  }
});

exec("bash entrypoint.sh", function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));