# Finish Today Checklist

Project: Secure Data Transmission over Netcat  
Team: Tanishk, Aastha, Aditi

## Priority Order

Follow this order so the project can be completed quickly.

### 1. Read the Demo Guide

File: `DEMO_GUIDE.md`

Everyone should understand only this core point:

> Plain Netcat traffic is readable in Wireshark. Encrypted Ncat SSL traffic is not readable.

### 2. Install Tools

On Ubuntu/Linux:

```bash
sudo apt update
sudo apt install netcat-openbsd ncat wireshark openssl -y
```

On Windows:

- Install Nmap for Ncat.
- Install Wireshark.
- During Wireshark/Npcap setup, enable loopback capture if available.

### 3. Run the Plaintext Demo

Use port `4444`.

Take screenshots of:

- Receiver terminal
- Sender terminal
- Wireshark "Follow TCP Stream" showing readable message

### 4. Run the Encrypted Demo

Use port `4445`.

Take screenshots of:

- Certificate generation command
- Encrypted receiver terminal
- Encrypted sender terminal
- Wireshark "Follow TCP Stream" showing unreadable/encrypted data

### 5. Update Report

File already generated:

`Secure_Data_Transmission_over_Netcat_Report.docx`

Add your screenshots in the practical demonstration sections or appendix.

### 6. Update PPT

File already generated:

`Secure_Data_Transmission_over_Netcat_Presentation.pptx`

Add 2-4 screenshots:

- Plaintext Wireshark readable message
- Encrypted Wireshark unreadable traffic
- Optional terminal screenshots

### 7. Practice Presentation

Use:

- `PRESENTATION_SCRIPT.md`
- `VIVA_QA.md`

## Final Submission Files

Submit these:

1. `Secure_Data_Transmission_over_Netcat_Report.docx`
2. `Secure_Data_Transmission_over_Netcat_Presentation.pptx`
3. Screenshots added inside report/PPT
4. Optional: demo files and commands if professor asks

## Best One-Line Conclusion

Normal Netcat sends data in plaintext, so Wireshark can read it. Ncat SSL encrypts the same data, so Wireshark cannot read the message, proving confidentiality.
