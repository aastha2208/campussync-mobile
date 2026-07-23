# Finish Today Checklist

Project: Secure Data Transmission over Netcat  
Team: Tanishk, Aastha, Aditi

## Priority Order

### 1. Open the Updated Files

Use these latest detailed files:

- `Secure_Data_Transmission_over_Netcat_Report.docx`
- `Secure_Data_Transmission_over_Netcat_Presentation.pptx`

The PPT has 25 slides and a network security themed background on every slide.

### 2. Read the Demo Guide

File: `DEMO_GUIDE.md`

Core idea:

> Plain Netcat traffic is readable in Wireshark. Encrypted Ncat SSL traffic is not readable.

### 3. Install Tools

Ubuntu/Linux:

```bash
sudo apt update
sudo apt install netcat-openbsd ncat wireshark openssl -y
```

Windows:

- Install Nmap for Ncat.
- Install Wireshark.
- During Wireshark/Npcap setup, enable loopback capture if available.

### 4. Run Plaintext Demo

Use port `4444`.

Take screenshots of:

- Receiver terminal
- Sender terminal
- Wireshark Follow TCP Stream showing readable message

### 5. Run Encrypted Demo

Use port `4445`.

Take screenshots of:

- Certificate generation command
- Encrypted receiver terminal
- Encrypted sender terminal
- Wireshark Follow TCP Stream showing unreadable/encrypted data

### 6. Add Screenshots

Add screenshots into:

- Report practical demonstration sections
- PPT slide 18 or nearby result slides

### 7. Practice Presentation

Use:

- `PRESENTATION_SCRIPT.md`
- `VIVA_QA.md`

## Final Submission Files

1. `Secure_Data_Transmission_over_Netcat_Report.docx`
2. `Secure_Data_Transmission_over_Netcat_Presentation.pptx`

## Best One-Line Conclusion

Normal Netcat sends data in plaintext, so Wireshark can read it. Ncat SSL encrypts the same data, so Wireshark cannot read the message, proving confidentiality.
