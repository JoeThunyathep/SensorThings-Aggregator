const express = require("express");
const app = express();
const fs = require('fs');
let configjson = fs.readFileSync('config.json');  
let config = JSON.parse(configjson);  
const PORT = process.env.PORT || config["port"];
var spawn = require("child_process").spawn;

app.use(express.static(__dirname));
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Example request: http://localhost:8086/sta_aggregator_adv?url=%22http://193.196.37.89:8080/smartvillage1/v1.0/Datastreams(1)/Observations%22&timeinterval=3600
app.get("/sta_aggregator/", function (req, res, next) {
  if (typeof req.query.url == "string" && typeof req.query.timeinterval == "string" && typeof req.query.aggtype == "string") {
    var requesturl = req.query.url;
    var requesturlupdate = requesturl.replace(/['"]+/g, "");
    //requesturlupdate = requesturlupdate.replace(/%20/gi, " ");
    var timeinterval = req.query.timeinterval;
    var aggType;
    if (typeof req.query.url == "string") {
      aggType = req.query.aggtype;
    } else {
      aggType = "sum";
    }
    var process = spawn('python', ["pdTimeSeriesAnalysis.py",
      requesturlupdate,
      timeinterval,
      aggType]);
    process.stdout.on('data', function (data) {
      var responseData = data.toString();
      res.send(responseData);
      console.log("process complete - URL:" +requesturlupdate)
    })
    process.stderr.on(
      'data',
      logOutput('stderr')
    );
  } else if (typeof req.query.url == "string") {
    res.send({
      "missing query parameter": "timeinterval",
      "check the document": "LinkToSTADoc"
    });
  } else if (typeof req.query.timeinterval == "string") {
    res.send({
      "missing query parameter": "url",
      "check the document": "LinkToSTADoc"
    });
  } else {
    res.send({
      "missing query parameter": "url, timeinterval",
      "check the document": "LinkToSTADoc",
      "Example": "http://localhost:8080/sta_aggregator_adv?url=%22http://193.196.37.89:8080/smartvillage1/v1.0/Datastreams(1)/Observations%22&timeinterval=3600"
    });
  }
});

const logOutput = (name) => (data) => console.log(`[${name}] ${data.toString()}`)