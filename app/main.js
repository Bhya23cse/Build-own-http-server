const net = require("net");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
let directory = null;

// Extract --directory flag value
for (let i = 0; i < args.length; i++) {
    if (args[i] === "--directory" && i + 1 < args.length) {
        directory = args[i + 1];
    }
}

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const [requestLine, ...headersAndBody] = request.split("\r\n");
        const [method, requestPath] = requestLine.split(" ");

        // Extract headers
        const headers = {};
        for (const line of headersAndBody) {
            if (line === "") break;
            const [key, value] = line.split(": ");
            headers[key] = value;
        }

        let response = "";

        if (method === "GET" && requestPath === "/") {
            response = "HTTP/1.1 200 OK\r\n\r\n";
        } else if (method === "GET" && requestPath.startsWith("/echo/")) {
            const text = requestPath.slice("/echo/".length);
            response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(text)}\r\n\r\n${text}`;
        } else if (method === "GET" && requestPath === "/user-agent") {
            const userAgent = headers["User-Agent"] || "";
            response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(userAgent)}\r\n\r\n${userAgent}`;
        } else if (method === "GET" && requestPath.startsWith("/files/")) {
            const filename = requestPath.slice("/files/".length);
            const filePath = path.join(directory, filename);

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                } else {
                    socket.write(
                        `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n`
                    );
                    socket.write(content);
                }
                socket.end();
            });
            return;
        } else {
            response = "HTTP/1.1 404 Not Found\r\n\r\n";
        }

        socket.write(response);
        socket.end();
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server running at http://localhost:4221");
});
