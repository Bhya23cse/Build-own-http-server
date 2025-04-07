const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();

        // Parse request line
        const [requestLine] = request.split("\r\n");
        const [method, path] = requestLine.split(" ");

        console.log(`Incoming Request: ${method} ${path}`);

        // Create a basic response
        const body = "Hello from custom HTTP server!";
        const response =
            "HTTP/1.1 200 OK\r\n" +
            "Content-Type: text/plain\r\n" +
            `Content-Length: ${body.length}\r\n` +
            "\r\n" +
            body;

        socket.write(response);
        socket.end();
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server is running at http://localhost:4221");
});