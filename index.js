const express = require("express");
const app = express()
require('dotenv').config();
const aws = require("./routes/aws");
const db = require('./routes/db');

require('aws-sdk/lib/maintenance_mode_message').suppress = true;

/*File Upload */
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

const bodyparser = require("body-parser");
app.use(bodyparser.json({ limit: 100 }))

app.post("/upload-file", (req, res) => {
    if (req.files && req.files.image) {
        aws.uploadS3(req.files.image).then(data => {
            res.send("file uploaded successfully - " + JSON.stringify(data));
        }).catch(err => {
            res.send("Some error occured");
        })
    } else {
        res.send({ message: "Please choose image file" })
    }
})

app.get("/list", (req, res) => {
    aws.listFiles().then(data => {
        console.log(JSON.stringify(data, null, 2));
        res.send(data)
    });
})

app.delete("/delete-folder", (req, res) => {
    aws.deleteFolder(req.body.folder).then(data => {
        res.send("folder deleted" + JSON.stringify(data));
    }).catch(err => {
        res.send("Some error" + err)
    })
})

app.put("/rename", (req, res) => {
    aws.renameFile(req.body.oldname, req.body.newname).then(data => {
        res.send("renamed")
    }).catch(err => {
        res.send("error")
    })
})

app.put("/create-folder", (req, res) => {
    aws.createFolder(req.body.folder_name).then(data => {
        res.send("created" + JSON.stringify(data))
    }).catch(err => {
        console.log(err)
        res.send("error")
    })
})

app.get("/signed-url", (req, res) => {
    res.send(aws.getSignedURL(req.body.file))
})

app.listen(3000, () => console.log("Listening at 3000"));