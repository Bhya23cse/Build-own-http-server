const net = require("net");

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        // Log the incoming request (optional)
        console.log("Received request:\n" + data.toString());

        // Basic HTTP response with status 200 OK
        const response = 
            "HTTP/1.1 200 OK\r\n" +
            "Content-Type: text/plain\r\n" +
            "Content-Length: 13\r\n" +
            "\r\n" +
            "Hello, World!";

        // Send the response
        socket.write(response);
        socket.end();
    });

    socket.on("close", () => {
        console.log("Connection closed");
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server is listening on port 4221");
});
