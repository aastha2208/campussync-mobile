# Simple Presentation Script

Project: Secure Data Transmission over Netcat  
Team: Tanishk, Aastha, Aditi

Use this script during practice. You do not have to memorize every word. Understand the meaning and speak naturally.

---

## Slide 1: Title

Good morning/afternoon. Our topic is "Secure Data Transmission over Netcat: Demonstrating Confidentiality through Plaintext vs Encrypted Channels." Our team members are Tanishk, Aastha, and Aditi.

---

## Slide 2: AAT Requirement Mapping

Our project follows the AAT requirements. We introduce the tool Netcat, show installation and setup, perform a practical demonstration, demonstrate cryptanalysis using Wireshark, explain the security relevance, and conclude with our observations.

---

## Slide 3: Problem Statement

When data travels through a network, it can be captured by attackers. If the data is sent in plaintext, the attacker can read it. Our project demonstrates this problem and then shows how encryption protects the message.

---

## Slide 4: What is Netcat?

Netcat is a command-line networking tool used to send and receive data over TCP or UDP. It is useful for testing connections and transferring simple data. But normal Netcat does not encrypt the data.

---

## Slide 5: Confidentiality

Confidentiality means that only authorized people should be able to read the data. Plaintext means readable data. Ciphertext means encrypted unreadable data. Encryption helps provide confidentiality.

---

## Slide 6: Tools Used

We used Netcat for plaintext transmission, Ncat SSL for encrypted transmission, Wireshark for packet capture, and OpenSSL for creating a temporary certificate.

Important point: Ncat is a Netcat-compatible tool. We used it because traditional Netcat does not support encryption.

---

## Slide 7: Mini Project Workflow

First, we create a secret message file. Then we send it using normal Netcat and capture it in Wireshark. After that, we send the same file using encrypted Ncat SSL and again capture it in Wireshark. Finally, we compare both results.

---

## Slide 8: Experiment 1 - Plaintext Netcat

In the first experiment, the receiver listens on port 4444 using Netcat. The sender sends the secret file to the receiver. Wireshark captures the traffic on the same port.

The important observation is that the message is visible in Wireshark.

---

## Slide 9: Cryptanalysis

For cryptanalysis, we used packet sniffing with Wireshark. In the plaintext channel, there is no encryption. So the attacker only has to capture the TCP stream and the secret message becomes readable.

This proves that confidentiality is broken in plaintext communication.

---

## Slide 10: Experiment 2 - Encrypted Ncat SSL

In the second experiment, we first generate a temporary SSL certificate using OpenSSL. Then the receiver listens using Ncat SSL on port 4445. The sender sends the same file using Ncat SSL.

---

## Slide 11: Encrypted Channel Observation

The receiver receives the correct message, but Wireshark cannot show the message in readable form. The captured data appears encrypted. This proves that encryption protects confidentiality.

---

## Slide 12: Comparison

In plaintext Netcat, the message is visible in Wireshark, so confidentiality is not protected. In encrypted Ncat SSL, the message is not visible in Wireshark, so confidentiality is protected.

---

## Slide 13: Applications

This concept is used in real life in HTTPS websites, SSH remote login, VPNs, secure file transfer, and encrypted messaging applications.

---

## Slide 14: Limitations

Traditional Netcat does not provide encryption. Ncat SSL is good for learning and demonstration, but for real systems, tools such as SSH, SCP, HTTPS, or VPN are preferred.

---

## Slide 15: Conclusion

Our project proves that plaintext channels are unsafe for confidential data because the message can be captured and read. Encrypted channels protect the same data from packet sniffing and provide confidentiality.

Thank you.

---

## Team Split

### Tanishk

Slides 1 to 4 and plaintext demo.

### Aastha

Slides 5 to 10 and encrypted demo.

### Aditi

Slides 11 to 15, Wireshark observations, comparison, and conclusion.
