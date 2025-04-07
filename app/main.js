const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        console.log("Raw Request:\n" + request);

        // Extract the first line of the request (e.g., "GET /some/path HTTP/1.1")
        const [requestLine] = request.split("\r\n");
        
        // Split the request line into method, path, and HTTP version
        const [method, path, httpVersion] = requestLine.split(" ");

        console.log(`Method: ${method}`);
        console.log(`Path: ${path}`);
        console.log(`HTTP Version: ${httpVersion}`);

        // Response
        const response = 
            "HTTP/1.1 200 OK\r\n" +
            "Content-Type: text/plain\r\n" +
            "Content-Length: 13\r\n" +
            "\r\n" +
            "Hello, World!";

        socket.write(response);
        socket.end();
    });

    socket.on("close", () => {
        console.log("Connection has closed");
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server is listening on port 4221");
});
