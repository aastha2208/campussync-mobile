# Viva / Oral Presentation Questions and Answers

## 1. What is the main aim of your project?

The aim is to demonstrate confidentiality in data transmission by comparing plaintext Netcat communication with encrypted Ncat SSL communication.

## 2. What is Netcat?

Netcat is a command-line tool used to read and write data over network connections. It can be used for simple client-server communication, file transfer, and network testing.

## 3. Why is normal Netcat not secure?

Normal Netcat does not encrypt data. If someone captures the packets, they can read the message directly.

## 4. What is plaintext?

Plaintext is readable data before encryption. Example: a message that can be read exactly as typed.

## 5. What is ciphertext?

Ciphertext is encrypted data that looks unreadable to unauthorized people.

## 6. What is confidentiality?

Confidentiality means protecting information so that only authorized people can read it.

## 7. Which tool did you use for cryptanalysis?

We used Wireshark for packet capture and traffic inspection.

## 8. What did the plaintext experiment prove?

It proved that data sent using normal Netcat can be captured and read in Wireshark.

## 9. What did the encrypted experiment prove?

It proved that Ncat SSL hides the message from packet capture, while still delivering the correct file to the receiver.

## 10. Why did you use Ncat?

Ncat is a Netcat-compatible tool from the Nmap project. It supports SSL/TLS encryption, which traditional Netcat does not provide.

## 11. Is this safe for real production use?

It is good for learning and demonstration. For real systems, tools like SSH, SCP, HTTPS, or VPNs are preferred.

## 12. What is your final conclusion?

Plaintext channels are unsafe for confidential data. Encrypted channels protect data from packet sniffing and provide confidentiality.
