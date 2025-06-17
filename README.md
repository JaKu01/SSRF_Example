# SSRF Example

A simple Server-Side Request Forgery (SSRF) example using Express.js and Docker.

## Usage

Start the application using Docker Compose:

```bash
npm start # equals `docker-compose up --build`
```

### Logging Server
- This server logs (and persists) the URLs that are proxied by the public server.
- Therefore, it provides a /history endpoint
  - GET `/history` returns the logged URLs as a list
  - POST `/history` adds a new URL to the history

### Public Server
- This server exposes an endpoint that accepts a URL as a query parameter named ```proxy```.
- It fetches the content of the URL and returns it as a response.
```bash
# Example
curl "http://127.0.0.1:3000/?proxy=https://example.com"
```
- Also, the public server logs the visited urls using the API of the logging server.

### SSRF Attack
The application is vulnerable to an SSRF Attack by passing the URL of the logging server as the `proxy` parameter. 
This allows an attacker to read the logs of the logging server which itself is not publicly accessible.

```bash 
# Example
curl "http://localhost:3000/?proxy=http://logger/history"
```