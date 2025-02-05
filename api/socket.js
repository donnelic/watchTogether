const { Server } = require("socket.io");

// Initialize a variable to hold the socket server
let io;

// Export as a serverless function
export default function handler(req, res) {
    // Initialize socket.io only once
    if (!io) {
        io = new Server(res.socket.server, {
            cors: {
                origin: "*",
            },
        });

        io.on("connection", (socket) => {
            console.log("New client connected");

            // Emit the current video and state to the newly connected client
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
    }

    // Respond to the initial request
    res.end();
}
