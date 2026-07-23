# Simple Presentation Script for Expanded PPT

Project: Secure Data Transmission over Netcat  
Team: Tanishk, Aastha, Aditi

Use this script for practice. Do not memorize word-for-word; understand the idea and speak naturally.

## Slide 1: Title
Good morning/afternoon. Our topic is Secure Data Transmission over Netcat. We are demonstrating confidentiality by comparing plaintext Netcat communication with encrypted Ncat SSL communication.

## Slide 2: Why We Chose This Topic
We chose this topic because it is practical, easy to demonstrate, and directly related to cryptography. It gives clear visual proof through Wireshark.

## Slide 3: AAT Requirement Mapping
Our project follows all AAT requirements: tool introduction, setup, practical demo, cryptanalysis, application/relevance, report, and oral presentation.

## Slide 4: Problem Statement
If data is sent over a network without encryption, an attacker may capture and read it. Our project shows this risk using normal Netcat and then shows how encryption protects the same message.

## Slide 5: What is Netcat?
Netcat is a command-line networking tool. It can create simple sender-receiver connections and transfer data. However, normal Netcat sends data in plaintext.

## Slide 6: Why Use Ncat SSL?
Traditional Netcat does not provide encryption. Ncat is a Netcat-compatible tool that supports SSL/TLS encryption using the --ssl option. That is why we use it for the secure channel.

## Slide 7: Security Concept - Confidentiality
Confidentiality means only authorized users should read the data. Plaintext is readable data. Ciphertext is encrypted unreadable data. Encryption protects confidentiality.

## Slide 8: Tools Used
We used Netcat for plaintext transfer, Ncat SSL for encrypted transfer, Wireshark for packet capture, OpenSSL for certificate generation, and two terminals for sender and receiver.

## Slide 9: Mini Project Architecture
There are three roles: sender, receiver, and observer. The sender sends the file, the receiver receives it, and the observer uses Wireshark to check whether the message is visible.

## Slide 10: Demo Setup
The easiest setup is one laptop with two terminals and Wireshark. We use 127.0.0.1 as the IP, port 4444 for plaintext, and port 4445 for encrypted transfer.

## Slide 11: Create Secret Message File
We create one secret message file and use the same file in both experiments. This makes the comparison fair.

## Slide 12: Plaintext Experiment Commands
In the first experiment, the receiver listens using Netcat on port 4444, and the sender sends the secret file. Wireshark captures the packets on the same port.

## Slide 13: Plaintext Observation
The receiver gets the file, but Wireshark also shows the secret message. This proves that normal Netcat does not protect confidentiality.

## Slide 14: Cryptanalysis Demonstration
Our cryptanalysis is packet sniffing using Wireshark. In plaintext mode, there is no encryption to break, so the attacker can directly read the TCP stream.

## Slide 15: Generate SSL Certificate
Before encrypted transfer, we generate a temporary SSL certificate and key using OpenSSL. This is enough for a classroom demonstration.

## Slide 16: Encrypted Experiment Commands
In the second experiment, the receiver listens using Ncat SSL on port 4445, and the sender sends the same secret file using Ncat SSL.

## Slide 17: Encrypted Observation
The receiver still gets the correct file, but Wireshark cannot show the readable message. The traffic appears encrypted.

## Slide 18: Plaintext vs Encrypted Result
The main result is simple: plaintext Netcat is readable in Wireshark, while encrypted Ncat SSL hides the message.

## Slide 19: Comparison Table
Plaintext uses port 4444 and is readable. Encrypted transfer uses port 4445 and is unreadable to the observer. This proves confidentiality.

## Slide 20: Applications / Relevance
This concept is used in HTTPS, SSH, VPNs, secure file transfer, and encrypted messaging applications.

## Slide 21: Limitations
Normal Netcat has no encryption. Ncat SSL is good for learning, but real systems usually use SSH, SCP, HTTPS, or VPNs.

## Slide 22: Future Scope
The project can be extended with certificate verification, SSH/SCP comparison, larger file transfer, and hash-based integrity checking.

## Slide 23: Team Contribution
Tanishk explains Netcat and plaintext demo. Aastha explains confidentiality and encrypted demo. Aditi explains Wireshark observations, comparison, and conclusion.

## Slide 24: Final Conclusion
Normal Netcat sends plaintext, so Wireshark can read it. Ncat SSL encrypts the channel, so Wireshark cannot read the original message. Therefore, encryption is necessary for confidentiality.

## Slide 25: Command Reference
This slide is a backup slide containing all demo commands. Use it if the professor asks for exact commands.

## Recommended Speaking Split

### Tanishk
Slides 1 to 5 and plaintext Netcat introduction.

### Aastha
Slides 6 to 12 and encrypted-channel theory/setup.

### Aditi
Slides 13 to 25, Wireshark observations, comparison, conclusion, and command reference.
