# Secure Data Transmission over Netcat: Demonstrating Confidentiality through Plaintext vs Encrypted Channels

**Assignment Title:** Practical Exploration of Cryptography / Security Tools  
**Selected Tool:** Netcat / Ncat  
**Team Members:** Tanishk, Aastha, Aditi

## Abstract
This mini project demonstrates confidentiality in network communication using a simple sender-receiver model. First, a secret message is transmitted using normal Netcat. Wireshark is used to capture the packets, and the message is visible in readable form. This proves that normal Netcat communication is plaintext and not suitable for confidential data. Next, the same message is transmitted using Ncat SSL, a Netcat-compatible encrypted channel. The receiver still receives the correct message, but Wireshark cannot display the original message in readable form. This proves that encryption protects confidentiality during transmission.

## 1. Introduction of the Tool
Netcat is a command-line networking utility used to read and write data across network connections using TCP or UDP. It is often called a networking Swiss Army knife because it can create quick client-server connections, transfer files, test ports, and debug network services.

For this project, Netcat is used because it is simple and clearly shows what happens when data is sent over a network. Traditional Netcat does not provide encryption. Therefore, to demonstrate the encrypted version, we use Ncat with SSL. Ncat is a modern Netcat-compatible tool from the Nmap project and supports SSL/TLS encryption.

## 2. Problem Statement
In real networks, data packets travel through cables, Wi-Fi, routers, and switches. If the communication is not encrypted, a person with packet-capturing access may read the data. This is dangerous for passwords, private messages, login data, confidential documents, and financial information. The project demonstrates this risk using normal Netcat and then shows how an encrypted channel protects the same data.

## 3. Objectives
1. Understand basic Netcat sender-receiver communication.
2. Send a secret text file through a plaintext Netcat channel.
3. Capture plaintext traffic using Wireshark and prove that the message is readable.
4. Send the same file through an encrypted Ncat SSL channel.
5. Capture encrypted traffic and prove that the original message is not readable.
6. Relate the demonstration to confidentiality in cryptography and network security.

## 4. Marking Scheme Alignment
| AAT Requirement | How Our Project Covers It |
|---|---|
| Understanding of tool and usage | Explains Netcat, Ncat SSL, ports, sender, receiver, and commands. |
| Practical demonstration | Shows plaintext and encrypted file transfer. |
| Cryptanalysis demonstration | Uses Wireshark packet sniffing to compare readable and unreadable traffic. |
| Application / relevance | Connects the demo to HTTPS, SSH, VPN, and secure file transfer. |
| Report | Includes theory, setup, methodology, commands, observations, screenshots, and conclusion. |
| Oral presentation | PPT, speaking script, and viva Q&A are prepared. |

## 5. Tools and Setup
| Tool | Purpose |
|---|---|
| Netcat (`nc`) | Creates plaintext sender and receiver connection. |
| Ncat (`ncat --ssl`) | Creates encrypted Netcat-compatible connection. |
| Wireshark | Captures and analyzes packets. |
| OpenSSL | Generates a temporary SSL certificate and key. |
| Two terminals | One terminal acts as receiver and one terminal acts as sender. |

Installation on Ubuntu/Linux:
```bash
sudo apt update
sudo apt install netcat-openbsd ncat wireshark openssl -y
```

Recommended beginner setup: use one laptop with two terminals and Wireshark. Use `127.0.0.1` as the receiver IP address. If Wireshark does not show loopback traffic on Windows, use two laptops on the same Wi-Fi network.

## 6. Basic Theory
**Plaintext** is readable data. Example: `This is confidential CRP data`.  
**Ciphertext** is encrypted unreadable data.  
**Confidentiality** means only authorized users should be able to read the data.  
**Encryption** converts plaintext into ciphertext so that captured packets do not reveal the original message.

Normal Netcat sends data as plaintext. This means Wireshark can show the message using Follow TCP Stream. Ncat SSL encrypts the channel using SSL/TLS, so Wireshark sees network packets but not the original readable message.

## 7. Project Architecture
The project contains three roles:
1. Sender: sends a secret file.
2. Receiver: receives the file.
3. Observer/attacker: captures traffic in Wireshark.

Plaintext flow: Sender -> Netcat plaintext channel -> Receiver. Wireshark can read the message.  
Encrypted flow: Sender -> Ncat SSL encrypted channel -> Receiver. Wireshark cannot read the message.

## 8. Practical Demonstration: Secret File
Create the secret file:
```bash
echo "This is confidential CRP data from Tanishk, Aastha and Aditi." > secret_message.txt
echo "If this line is visible in Wireshark, confidentiality is broken." >> secret_message.txt
```

## 9. Experiment 1: Plaintext Netcat Channel
Start Wireshark and use filter:
```text
tcp.port == 4444
```
Receiver terminal:
```bash
nc -lvnp 4444 > received_plain.txt
```
Sender terminal:
```bash
nc 127.0.0.1 4444 < secret_message.txt
```
Check received file:
```bash
cat received_plain.txt
```
Wireshark observation: right-click a packet, select Follow > TCP Stream. The secret message is visible in readable form.

## 10. Cryptanalysis Demonstration
For this project, cryptanalysis is shown through packet sniffing. In the plaintext channel, there is no encryption to break. The observer simply captures packets in Wireshark, follows the TCP stream, and reads the message. This proves that plaintext communication fails to provide confidentiality.

## 11. Experiment 2: Encrypted Ncat SSL Channel
Generate a temporary SSL certificate:
```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.crt -days 1 -subj "/CN=NetcatAAT"
```
Start Wireshark and use filter:
```text
tcp.port == 4445
```
Encrypted receiver terminal:
```bash
ncat --ssl --ssl-cert server.crt --ssl-key server.key -lvnp 4445 > received_secure.txt
```
Encrypted sender terminal:
```bash
ncat --ssl 127.0.0.1 4445 < secret_message.txt
```
Check received file:
```bash
cat received_secure.txt
```
Wireshark observation: Follow TCP Stream does not show the readable secret message. The captured data appears encrypted.

## 12. Results and Comparison
| Feature | Plaintext Netcat | Encrypted Ncat SSL |
|---|---|---|
| Port used | 4444 | 4445 |
| Tool command | `nc` | `ncat --ssl` |
| Receiver gets message | Yes | Yes |
| Wireshark can read message | Yes | No |
| Confidentiality | Not protected | Protected |
| Attacker effort | Very easy | Cannot read without decryption key |
| Suitable for sensitive data | No | Better for demonstration of secure channel |

## 13. Application and Relevance
This project relates directly to real-world security. HTTPS encrypts website traffic, SSH encrypts remote login, VPNs encrypt network traffic on unsafe networks, and secure file transfer tools encrypt files during transmission. The same basic idea is demonstrated in this project: readable plaintext is unsafe, while encrypted data protects confidentiality.

## 14. Limitations
1. Traditional Netcat does not support encryption by default.
2. Ncat SSL is used for learning and demonstration, not as a replacement for well-managed production systems.
3. Self-signed certificates are acceptable for lab demos but not recommended for public production services.
4. This project mainly focuses on confidentiality; authentication and integrity can be discussed as future improvements.

## 15. Future Scope
The project can be extended by adding certificate verification, comparing SSH/SCP with Netcat, transferring larger files, calculating hashes before and after transfer to prove integrity, or demonstrating how HTTPS uses TLS similarly.

## 16. Team Contribution
| Member | Responsibility |
|---|---|
| Tanishk | Netcat introduction, setup, plaintext demo. |
| Aastha | Confidentiality theory, encryption explanation, Ncat SSL demo. |
| Aditi | Wireshark analysis, comparison table, report/PPT conclusion. |

## 17. Conclusion
The project successfully demonstrates the importance of encryption in secure data transmission. Normal Netcat sends the message as plaintext, and Wireshark can read it easily. Ncat SSL sends the same message through an encrypted channel, so Wireshark cannot show the readable message. Therefore, encrypted channels protect confidentiality and are necessary when sensitive data is transmitted over a network.

## References
1. Nmap Ncat documentation: https://nmap.org/ncat/
2. Wireshark documentation: https://www.wireshark.org/docs/
3. OpenSSL documentation: https://www.openssl.org/docs/
4. Netcat manual pages

## Screenshot Checklist
1. Plaintext receiver command.
2. Plaintext sender command.
3. Wireshark Follow TCP Stream showing readable message on port 4444.
4. OpenSSL certificate generation command.
5. Encrypted receiver command.
6. Encrypted sender command.
7. Wireshark Follow TCP Stream showing unreadable encrypted data on port 4445.
