const net = require("node:net");
const fs = require("node:fs/promises");
const readLine = require("node:readline/promises");
const path = require("path");
const PORT = 8080;
const ipvSix = "::1";

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clearLine = (dir) => {
  return new Promise((resolve, reject) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};

const moveCursor = (dx, dy) => {
  return new Promise((resolve, reject) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const client = net.createConnection({ port: PORT, host: ipvSix }, async () => {
  const filePath = process.argv[2];
  const fileName = path.basename(filePath);
  const fileHandle = await fs.open(filePath, "r");
  const fileReadStream = fileHandle.createReadStream();

  const fileSize = (await fileHandle.stat()).size;
  let uploadedPercentage = 0;
  let bytesUploaded = 0;
  client.write(`fileName: ${fileName}-------`);
  //? Reading from the source file.....
  fileReadStream.on("data", async (chunk) => {
    if (!client.write(chunk)) {
      fileReadStream.pause();
    }
    bytesUploaded += chunk.length;
    let newPercentage = Math.floor((bytesUploaded / fileSize) * 100);

    if (newPercentage % 5 === 0 && newPercentage !== uploadedPercentage) {
      uploadedPercentage = newPercentage;
      await moveCursor(0, -1);
      await clearLine(0);
      console.log(`Uploaded: ${newPercentage}%`);
    }
  });

  client.on("drain", () => {
    console.log("the file is successfully drained");
    fileReadStream.resume();
  });

  fileReadStream.on("end", () => {
    console.log("The file was successfully sent");
    client.end();
  });
});

// const canWrite = client.write(chunk);
//         if(!canWrite){
//             client.pause()
//             client.on('drain', ()=>{
//                 console.log('the file is successfully drained')
//                 client.resume()
//             })
//         }
