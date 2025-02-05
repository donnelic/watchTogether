const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "*"
    },
});

let currentVideo = "";
let currentState = { time: 0, playing: false };

io.on("connection", (socket) => {
    socket.emit("updateVideo", currentVideo);
    socket.emit("sync", currentState);

    socket.on("setVideo", (url) => {
        currentVideo = url;
        io.emit("updateVideo", url);
    });

    socket.on("sync", (state) => {
        currentState = state;
        socket.broadcast.emit("sync", state);
    });
});

// Export as a serverless function
module.exports = (req, res) => {
    if (req.method === "GET") {
        io(req, res);
    } else {
        res.status(405).end(); // Method Not Allowed
    }
};
