const net = require("net");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const args = process.argv.slice(2);
let directory = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--directory" && i + 1 < args.length) {
        directory = args[i + 1];
    }
}

const server = net.createServer((socket) => {
    let buffer = "";

    socket.on("data", (data) => {
        buffer += data.toString();

        const [headerPart, body] = buffer.split("\r\n\r\n");
        const lines = headerPart.split("\r\n");
        const [method, requestPath] = lines[0].split(" ");

        const headers = {};
        for (let i = 1; i < lines.length; i++) {
            const [key, value] = lines[i].split(": ");
            headers[key] = value;
        }

        // GET /
        if (method === "GET" && requestPath === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
            socket.end();
            return;
        }

        // GET /echo/{str} with gzip compression
        if (method === "GET" && requestPath.startsWith("/echo/")) {
            const text = requestPath.slice("/echo/".length);

            if ((headers["Accept-Encoding"] || "").includes("gzip")) {
                const bufferText = Buffer.from(text, "utf-8");
                zlib.gzip(bufferText, (err, compressed) => {
                    if (err) {
                        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
                        socket.end();
                        return;
                    }

                    const response = 
                        "HTTP/1.1 200 OK\r\n" +
                        "Content-Encoding: gzip\r\n" +
                        "Content-Type: text/plain\r\n" +
                        `Content-Length: ${compressed.length}\r\n\r\n`;

                    socket.write(response);
                    socket.write(compressed);
                    socket.end();
                });
            } else {
                const response = 
                    "HTTP/1.1 200 OK\r\n" +
                    "Content-Type: text/plain\r\n" +
                    `Content-Length: ${Buffer.byteLength(text)}\r\n\r\n${text}`;
                socket.write(response);
                socket.end();
            }
            return;
        }

        // GET /user-agent
        if (method === "GET" && requestPath === "/user-agent") {
            const userAgent = headers["User-Agent"] || "";
            socket.write(
                `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(userAgent)}\r\n\r\n${userAgent}`
            );
            socket.end();
            return;
        }

        // GET /files/{filename}
        if (method === "GET" && requestPath.startsWith("/files/")) {
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
        }

        // POST /files/{filename}
        if (method === "POST" && requestPath.startsWith("/files/")) {
            const filename = requestPath.slice("/files/".length);
            const filePath = path.join(directory, filename);
            const contentLength = parseInt(headers["Content-Length"] || "0", 10);

            const bodyBuffer = Buffer.from(body || "");
            if (bodyBuffer.length >= contentLength) {
                fs.writeFile(filePath, bodyBuffer.slice(0, contentLength), (err) => {
                    if (err) {
                        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
                    } else {
                        socket.write("HTTP/1.1 201 Created\r\n\r\n");
                    }
                    socket.end();
                });
            } else {
                socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
                socket.end();
            }
            return;
        }

        // Unknown
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
    });
});

server.listen(4221, "localhost", () => {
    console.log("Server is listening on http://localhost:4221");
});
