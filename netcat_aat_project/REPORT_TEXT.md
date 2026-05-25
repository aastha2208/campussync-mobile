# Secure Data Transmission over Netcat: Demonstrating Confidentiality through Plaintext vs Encrypted Channels

**Assignment Title:** Practical Exploration of Cryptography / Security Tools  
**Selected Tool:** Netcat / Ncat  
**Team Members:** Tanishk, Aastha, Aditi

---

## Abstract

This mini project demonstrates why confidential data should not be sent using a normal plaintext network channel. Netcat is a simple networking tool that can send messages or files between two systems. In its normal form, Netcat sends data as plaintext, which means an attacker using a packet capture tool such as Wireshark can read the transmitted message. To show the secure alternative, we use Ncat, a Netcat-compatible tool that supports SSL/TLS encryption. The same message is transmitted once through a plaintext Netcat channel and once through an encrypted Ncat SSL channel. The captured traffic is then compared. The result clearly shows that plaintext traffic is readable, while encrypted traffic is not understandable to the attacker. This proves the importance of confidentiality in secure data transmission.

---

## 1. Introduction of the Tool

Netcat is a command-line networking utility used to read from and write to network connections using TCP or UDP. It is often called the "Swiss Army knife" of networking because it can be used for testing ports, sending messages, transferring files, and debugging network services.

For this project, Netcat is used to create a simple sender-receiver communication channel. The normal Netcat command sends data in plaintext. This is useful for learning, but unsafe for confidential information. To demonstrate secure transmission, we use Ncat with SSL support. Ncat is part of the Nmap project and is compatible with Netcat-style usage, but it also supports encrypted communication using SSL/TLS.

In simple words:

- **Netcat (`nc`)**: sends data normally, but without encryption.
- **Ncat (`ncat --ssl`)**: sends data through an encrypted SSL/TLS channel.
- **Wireshark**: captures packets and helps us compare plaintext and encrypted traffic.

---

## 2. Objective of the Project

The main objective is to demonstrate confidentiality during data transmission.

Specific objectives:

1. To understand how Netcat sends data between two systems.
2. To demonstrate that plaintext Netcat traffic can be read by an attacker.
3. To demonstrate encrypted data transmission using Ncat SSL.
4. To compare plaintext traffic and encrypted traffic using Wireshark.
5. To explain why encryption is important in cryptography and network security.

---

## 3. Installation and Setup

### Required Tools

| Tool | Purpose |
|---|---|
| Netcat / Ncat | To send data between sender and receiver |
| Wireshark | To capture and inspect network packets |
| OpenSSL | To generate a temporary SSL certificate for encrypted demo |
| Two terminals | One terminal acts as receiver, one acts as sender |

### Recommended Setup

The easiest setup is one laptop with two terminals:

- Terminal 1: Receiver
- Terminal 2: Sender
- Wireshark: Packet capture

If two laptops are available, one laptop can be sender and the other can be receiver. Both should be connected to the same Wi-Fi network.

### Ubuntu / Linux Installation Commands

```bash
sudo apt update
sudo apt install netcat-openbsd ncat wireshark openssl -y
```

### Windows Installation

1. Install Nmap from: https://nmap.org/download.html  
   Ncat is included with Nmap.
2. Install Wireshark from: https://www.wireshark.org/download.html
3. During Wireshark/Npcap installation, enable loopback capture if using one laptop.

---

## 4. Basic Theory

### 4.1 What is Plaintext?

Plaintext means readable data. If we send the message "CRP secret data" without encryption, anyone who captures the packet can read the exact message.

### 4.2 What is Encryption?

Encryption converts readable data into unreadable ciphertext using cryptographic algorithms. Only the correct receiver can decrypt it.

### 4.3 What is Confidentiality?

Confidentiality is one of the main goals of cybersecurity. It means that data should be visible only to authorized users. In this project, confidentiality is shown by comparing readable plaintext traffic with unreadable encrypted traffic.

### 4.4 Why Netcat Alone is Not Secure

Traditional Netcat does not provide encryption. It simply sends bytes over the network. Therefore, it is useful for testing but should not be used alone to send passwords, private messages, or sensitive files.

### 4.5 Why Ncat SSL is Used

Ncat is a modern Netcat-family tool. It supports SSL/TLS encryption. TLS is the same basic security technology used by HTTPS websites. In this project, Ncat SSL is used to show how encryption protects data in transit.

---

## 5. Mini Project Architecture

The project has three roles:

1. **Sender**: Sends a secret message/file.
2. **Receiver**: Receives the message/file.
3. **Attacker/Observer**: Uses Wireshark to capture packets and check whether the message is readable.

### Plaintext Flow

Sender -> Plaintext Netcat Channel -> Receiver  
Attacker using Wireshark -> Can read the message

### Encrypted Flow

Sender -> Encrypted Ncat SSL Channel -> Receiver  
Attacker using Wireshark -> Cannot read the message

---

## 6. Practical Demonstration

### Important Safety Note

This project is for educational demonstration only. Run it on your own laptop, lab computers, or with permission on a local network. Do not capture other people's traffic.

### Demo Message

Create a file named `secret_message.txt`:

```text
This is confidential CRP data from Tanishk, Aastha and Aditi.
If this line is visible in Wireshark, confidentiality is broken.
```

---

## 7. Experiment 1: Plaintext Data Transmission using Netcat

### Step 1: Start Wireshark Capture

Open Wireshark and start capturing on:

- `lo` / loopback interface if using one Linux laptop with `127.0.0.1`
- Wi-Fi interface if using two laptops

Use this display filter:

```text
tcp.port == 4444
```

### Step 2: Start Receiver

In Terminal 1:

```bash
nc -lvnp 4444 > received_plain.txt
```

### Step 3: Send File from Sender

In Terminal 2:

```bash
nc 127.0.0.1 4444 < secret_message.txt
```

If using two laptops, replace `127.0.0.1` with the receiver laptop IP address.

### Step 4: Check Received File

```bash
cat received_plain.txt
```

### Step 5: Wireshark Observation

In Wireshark:

1. Apply filter: `tcp.port == 4444`
2. Right-click a packet.
3. Select **Follow > TCP Stream**.
4. Observe that the secret message is visible in readable form.

### Result

The confidential message is visible in Wireshark. This proves that normal Netcat does not provide confidentiality.

---

## 8. Cryptanalysis Demonstration

In this project, cryptanalysis is demonstrated as traffic inspection/packet sniffing.

In the plaintext experiment, the attacker does not need to break any encryption because there is no encryption. The attacker simply captures packets using Wireshark and follows the TCP stream. The secret message appears directly on screen.

This is a practical attack because many real-world attackers use packet sniffing on unsafe networks to steal plaintext information.

### Cryptanalysis Observation for Plaintext Channel

| Item | Observation |
|---|---|
| Capture tool | Wireshark |
| Port observed | 4444 |
| Message readable? | Yes |
| Confidentiality protected? | No |
| Attack difficulty | Easy |

---

## 9. Experiment 2: Encrypted Transmission using Ncat SSL

### Step 1: Generate Temporary SSL Certificate

Run this once:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.crt -days 1 -subj "/CN=NetcatAAT"
```

This creates:

- `server.key`: private key
- `server.crt`: certificate

For this class demo, a temporary self-signed certificate is enough.

### Step 2: Start Wireshark Capture

Use this display filter:

```text
tcp.port == 4445
```

### Step 3: Start Encrypted Receiver

In Terminal 1:

```bash
ncat --ssl --ssl-cert server.crt --ssl-key server.key -lvnp 4445 > received_secure.txt
```

### Step 4: Send File through Encrypted Channel

In Terminal 2:

```bash
ncat --ssl 127.0.0.1 4445 < secret_message.txt
```

If using two laptops, replace `127.0.0.1` with the receiver laptop IP address.

### Step 5: Check Received File

```bash
cat received_secure.txt
```

### Step 6: Wireshark Observation

In Wireshark:

1. Apply filter: `tcp.port == 4445`
2. Right-click a packet.
3. Select **Follow > TCP Stream**.
4. Observe that the secret message is not visible in readable form.

### Result

The receiver gets the correct message, but the captured packets do not show readable data. This proves that encryption provides confidentiality.

---

## 10. Comparison Table

| Feature | Plaintext Netcat | Encrypted Ncat SSL |
|---|---|---|
| Command used | `nc` | `ncat --ssl` |
| Port | 4444 | 4445 |
| Data visible in Wireshark | Yes | No |
| Confidentiality | Not provided | Provided |
| Attacker can read message | Yes | No |
| Suitable for sensitive data | No | Better than plaintext |
| Learning value | Shows insecurity | Shows protection |

---

## 11. Application and Relevance to Cryptography / Security

This project is relevant because many applications send data over networks. If the data is not encrypted, attackers may capture and read it. Encryption protects confidentiality.

Real-world applications:

1. HTTPS protects website data.
2. SSH protects remote login sessions.
3. VPNs protect network traffic.
4. Secure file transfer tools protect files during transmission.
5. Messaging applications use encryption to protect private chats.

This project shows the same concept in a simple and practical way using Netcat-style commands.

---

## 12. Limitations

1. Traditional Netcat does not support encryption by default.
2. Ncat SSL is useful for demonstration but not a full replacement for secure tools like SSH or SCP.
3. Self-signed certificates are acceptable for lab demos but not ideal for production systems.
4. The project focuses mainly on confidentiality, not authentication or integrity in full detail.

---

## 13. Team Contribution

| Member | Suggested Responsibility |
|---|---|
| Tanishk | Explain Netcat basics and perform plaintext demo |
| Aastha | Explain confidentiality, encryption, and Ncat SSL demo |
| Aditi | Explain Wireshark observations, comparison table, conclusion |

---

## 14. Conclusion

The project successfully demonstrates secure data transmission over a Netcat-style tool. In the first experiment, normal Netcat sends data as plaintext, and the secret message is easily visible in Wireshark. In the second experiment, Ncat SSL encrypts the channel, so the same message is delivered to the receiver but is not readable in packet capture. Therefore, encryption protects confidentiality during data transmission.

Final conclusion: **Plaintext channels are unsafe for confidential data, while encrypted channels protect data from packet sniffing attacks.**

---

## 15. References

1. Netcat manual pages
2. Nmap Ncat documentation: https://nmap.org/ncat/
3. Wireshark documentation: https://www.wireshark.org/docs/
4. OpenSSL documentation: https://www.openssl.org/docs/

---

## Appendix A: Screenshot Checklist

Add these screenshots in the final report/PPT after running the demo:

1. Terminal showing plaintext receiver command.
2. Terminal showing plaintext sender command.
3. Wireshark TCP stream showing readable secret message on port 4444.
4. Terminal showing certificate generation.
5. Terminal showing encrypted receiver command.
6. Terminal showing encrypted sender command.
7. Wireshark TCP stream showing unreadable encrypted data on port 4445.
8. Comparison table.
