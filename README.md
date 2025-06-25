# SSRF Example

A simple Server-Side Request Forgery (SSRF) example using Express.js and Docker.

## Getting Started

Start the application using Docker Compose:

```bash
npm start # equals `docker-compose up --build`
```

---
## Explanation

### Architecture
The application consists of two main servers
- **Logging Server**: Responsible for logging the proxied URLs. It is behind the firewall and therefore not publicly accessible. 
- **Public Server**: Accepts URLs to proxy and fetches their content. It is not protected by a firewall and can be accessed publicly.

![Architecture](images/SSRF-Vulnerable.svg)


### Logging Server
This server logs (and persists) the URLs that are proxied by the public server.
Therefore, it provides the following /history endpoint 
  - `GET /history` returns the logged URLs as a list
  - `POST /history` adds a new URL to the history

### Public Server
- This server exposes an endpoint that accepts a URL as a query parameter named `url`.
- It fetches the content of the URL and returns it as a response.

```bash
curl "http://localhost:3000/proxy?url=https://example.com"
```
- Also, the public server logs the visited urls using the API of the logging server.

### UI
- There is also a simple user interface available at `http://localhost:3000/` that allows you to enter a URL and see the response.
- The URL that you enter will be set as the proxy url.
  - So if you enter ```https://example.com``` the URL that the ui finally fetches will be `http://localhost:3000/proxy?url=https://example.com`.

---
## SSRF Attack
The application is vulnerable to an SSRF Attack by passing the URL of the logging server as the `url` parameter. 
This allows an attacker to read the logs of the logging server which itself is not publicly accessible.
In this example, the docker internal hostname `logger` is resolved to `10.0.0.67`

![SSRF Attack](images/SSRF-Attack.svg)


```bash 
curl "http://localhost:3000/?proxy=http://logger/history"
```

## Countermeasures 

### Naive Approach
A naive approach to protect against SSRF attacks is to put specific URLs on a blacklist. <br>
In this case, that would the docker internal hostname: `http://logger/history`

**Why this is not enough?** <br>
An attacker can still access the logging server by using the IP address instead of the internal URL.

![SSRF Attack with IP](images/SSRF-Attack-IP.svg)

---

### Advanced Approach
Let's prevent the previous attack by adding the ip address of the logging server to the blacklist. <br>
In this case, that would be `http://10.0.0.67`, so our blacklist now contains `http://logger/history` and `http://10.0.0.67`.

**Why this is not enough?** <br>
An attacker can use a sneaky little trick to bypass the blacklist by doing a *DNS rebinding attack*.

*What is a DNS rebinding attack?* <br>
A DNS rebinding attack works by resolving a public domain to an internal IP address, allowing the attacker to bypass the firewall and access internal resources.
To perform a DNS rebinding attack, the attacker needs to control a domain, e.g. `evil.com` 
Then the attacker creates an A record that resolves `evil.com` to the internal IP address. <br>
In this example the record could look like this:
```
evil.com.       IN    A    10.0.0.67
```
When the attacker passes the URL `http://evil.com/history` to the public server, it will resolve to the internal IP address of the logging server and the attacker can access the logs.
![SSRF Attack with DNS Rebinding](images/SSRF-Attack-DNS-rebind.svg)

---

### Sophisticated Approach
As we learned in the previous section, a naive blacklist is not enough to protect against SSRF attacks, 
because an attacker can use any domain to perform a DNS rebinding attack. <br>

To prevent this, we basically have to options.
1. **Whitelist**: Only allow specific URLs to be proxied.
2. **DNS Rebinding Protection**: Implement a DNS rebinding protection mechanism that prevents the application from resolving internal IP addresses.

It should be noted that a whitelist is always better than a blacklist in terms of security, but it is not always feasible.
In this example the public server acts as a proxy server for the user, so a whitelist would not be practical. <br>
Building a DNS rebinding protection consists of several steps:

- **Parse the URL**
   - Use a safe parser. 
   - Allow only `http` and `https`.


- **Extract and Validate Host**
   - Reject bad schemes or malformed domains.
   - Normalize the hostname.


- **Check if Host is IP**
   - If it's an IP, block if it's private, loopback, etc.


- **Resolve Domain to IPs**
   - Use DNS to get A/AAAA records.
   - Block if any IP is internal or reserved.















