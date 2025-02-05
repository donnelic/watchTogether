const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "*",
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

// Export the handler function for Vercel
module.exports = (req, res) => {
    if (req.method === "GET") {
        res.status(200).send("Socket.IO Server is running.");
    } else {
        // Handle other HTTP methods if needed
        res.status(405).send("Method Not Allowed");
    }
};

// Attach the Socket.IO server to the Vercel function
io.listen(3000); // This line will not be used in Vercel
