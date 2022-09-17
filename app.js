import { create } from "ipfs-http-client";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { unlink, readFileSync } from "fs";

//for CSS
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ipfs = create({
  host: "localhost",
  port: "5001",
  protocol: "http",
});

const app = express();

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/upload", (req, res) => {
  const file = req.files.file;
  const fileName = req.body.fileName;
  const filePath = "files/" + fileName;

  file.mv(filePath, async (err) => {
    if (err) {
      console.log("Error: failed to download the file");
      return res.status(500).send(err);
    }

    const fileHash = await addFile(fileName, filePath);
    unlink(filePath, (err) => {
      if (err) console.log(err);
    });

    res.render("upload", { fileName, fileHash });
  });
});

const addFile = async (fileName, filePath) => {
  const file = readFileSync(filePath);
  const fileAdded = await ipfs.add({ path: fileName, content: file });
  const fileHash = fileAdded.cid;
  return fileHash;
};

app.listen(3000, () => {
  console.log("Server is listenong on port 3000");
});
