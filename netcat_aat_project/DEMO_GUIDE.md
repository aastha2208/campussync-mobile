# Beginner-Friendly Demo Guide

## Project

**Secure Data Transmission over Netcat: Demonstrating Confidentiality through Plaintext vs Encrypted Channels**

Team: Tanishk, Aastha, Aditi

This guide is written for beginners. Follow it step by step.

---

## What You Need to Prove

You only need to prove one main idea:

> Normal Netcat sends readable data. Encrypted Ncat sends unreadable data to an attacker.

This directly satisfies the AAT requirement:

- Introduction of tool
- Installation/setup
- Practical demonstration
- Cryptanalysis demonstration
- Application/relevance
- Conclusion
- Report preparation

---

## Best Setup for Finishing Today

Use **one laptop** with:

- Terminal 1 as receiver
- Terminal 2 as sender
- Wireshark as attacker/observer

Use IP address `127.0.0.1`.

If Wireshark does not show loopback packets on Windows, use two laptops on the same Wi-Fi instead.

---

## Create the Secret File

```bash
echo "This is confidential CRP data from Tanishk, Aastha and Aditi." > secret_message.txt
echo "If this line is visible in Wireshark, confidentiality is broken." >> secret_message.txt
```

---

## Demo 1: Plaintext Netcat

### Terminal 1: Receiver

```bash
nc -lvnp 4444 > received_plain.txt
```

### Terminal 2: Sender

```bash
nc 127.0.0.1 4444 < secret_message.txt
```

### Wireshark

Filter:

```text
tcp.port == 4444
```

Right-click a packet -> Follow -> TCP Stream.

### What to Say

"Here we used normal Netcat. The receiver got the message, but Wireshark also shows the same message clearly. So confidentiality is not protected."

---

## Demo 2: Encrypted Ncat SSL

### Generate Certificate

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.crt -days 1 -subj "/CN=NetcatAAT"
```

### Terminal 1: Encrypted Receiver

```bash
ncat --ssl --ssl-cert server.crt --ssl-key server.key -lvnp 4445 > received_secure.txt
```

### Terminal 2: Encrypted Sender

```bash
ncat --ssl 127.0.0.1 4445 < secret_message.txt
```

### Wireshark

Filter:

```text
tcp.port == 4445
```

Right-click a packet -> Follow -> TCP Stream.

### What to Say

"Now we sent the same file using Ncat SSL. The receiver still receives the correct message, but Wireshark cannot show the readable text. This proves confidentiality using encryption."

---

## Screenshot Checklist

Take these screenshots:

1. Plaintext receiver terminal.
2. Plaintext sender terminal.
3. Wireshark plaintext TCP stream showing readable message.
4. Certificate generation command.
5. Encrypted receiver terminal.
6. Encrypted sender terminal.
7. Wireshark encrypted TCP stream showing unreadable data.
8. Final comparison table from PPT/report.

---

## 3-Person Presentation Split

### Tanishk

- Introduce topic and Netcat.
- Explain what plaintext means.
- Run/show Demo 1.

### Aastha

- Explain confidentiality and encryption.
- Explain why Ncat SSL is used.
- Run/show Demo 2.

### Aditi

- Explain Wireshark observation.
- Explain cryptanalysis and comparison table.
- Give conclusion.

---

## Simple Viva Answers

**Q1. What is Netcat?**  
Netcat is a command-line networking tool used to send and receive data over TCP or UDP connections.

**Q2. What is the security problem with normal Netcat?**  
Normal Netcat sends data in plaintext, so captured traffic can be read.

**Q3. What is confidentiality?**  
Confidentiality means only authorized people should be able to read the data.

**Q4. What did Wireshark prove?**  
Wireshark proved that plaintext Netcat traffic is readable, while encrypted Ncat SSL traffic is not readable.

**Q5. Why did you use Ncat SSL?**  
Traditional Netcat does not provide encryption. Ncat is a Netcat-compatible tool that supports SSL/TLS encryption.

**Q6. What is the conclusion?**  
Plaintext transmission is unsafe for confidential data. Encrypted transmission protects the message from packet sniffing.
