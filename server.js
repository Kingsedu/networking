const net = require("node:net");
const fs = require("node:fs/promises");

const PORT_NUMBER = 8080;
const ipvSix = "::1";

const server = net.createServer(() => {});
server.on("connection", (socket) => {
  let fileHandle;
  let fileWriteStream;

  console.log("a new connection made");

  socket.on("data", async (data) => {
    if (!fileHandle) {
      socket.pause(); //?pause receiving data from the client;
      const indexOfDivider = data.indexOf("-------");
      const fileName = data.subarray(10, indexOfDivider).toString("utf-8");
      fileHandle = await fs.open(`storage/${fileName}`, "w");
      fileWriteStream = fileHandle.createWriteStream();
      fileWriteStream.write(data.subarray(indexOfDivider + 7));
      socket.resume(); //? resume receiving data from the client;
      fileWriteStream.on("drain", () => {
        socket.resume();
      });
    } else {
      if (!fileWriteStream.write(data)) {
        socket.pause();
      }
    }
  });

  socket.on("end", () => {
    if (fileHandle) fileHandle.close();
    fileHandle = undefined;
    fileWriteStream = undefined;
    console.log("connection ended");
  });
});

server.listen(PORT_NUMBER, ipvSix, () => {
  console.log(`Server is running on port ${PORT_NUMBER}`, server.address());
});

// fileHandle = await fs.open("./storage/test.txt", "w");

// fileStream = fileHandle.createWriteStream();
// //?writing to our destination file....
// if (!fileStream.write(data)) {
//   fileStream.on("drain", () => {
//     console.log("the file is successfully drained");
//     fileStream.write(data);
//   });
// }
