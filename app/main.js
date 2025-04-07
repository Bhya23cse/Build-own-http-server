const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const [requestLine] = request.split("\r\n");
        const [method, path] = requestLine.split(" ");

        let response;

        if (method === "GET" && path === "/") {
            response = "HTTP/1.1 200 OK\r\n\r\n";
        } else {
            response = "HTTP/1.1 404 Not Found\r\n\r\n";
        }

        socket.write(response);
        socket.end();
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server is running at http://localhost:4221");
});
