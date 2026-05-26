---
title: "Building a Homebrew Handheld Console from Scratch"
date: 2026-05-25T10:00:00+05:30
description: "A custom hardware dev log detailing ESP32-S3 pinouts, battery schematics, and case design."
categories: ["personal"]
tags: ["hardware", "esp32", "diy", "soldering"]
---

Over the last month, I have been building my own custom 8-bit handheld gaming console. My goal was simple: design a lightweight, tactile hardware deck that feels premium, looks like a retro-brutalist brick, and boots up instantly.

This post serves as a log documenting the pinouts, power design, and schematic considerations.

---

### Hardware Spec & Bill of Materials (BOM)

To keep costs and complexity reasonable, I selected widely available components with strong developer tooling support:

* **Microcontroller**: ESP32-S3-WROOM-1 (16MB Flash, 8MB PSRAM)
* **Display**: 2.8" SPI TFT LCD (ST7789 driver, $320 \times 240$ resolution)
* **Buttons**: Cherry MX Blue mechanical switches (for ultra-clicky tactile input)
* **Battery**: 1200mAh 3.7V LiPo with TP4056 charging IC
* **Audio**: I2S DAC (MAX98357A) paired with a 1W 8-Ohm micro speaker

---

### SPI Pin Mapping & Schematic

Routing high-speed SPI channels requires short, parallel trace runs to prevent signal degradation at 40MHz. Here is the pinout configuration I soldered together on the prototype protoboard:

```ini
[SPI Display Bus]
ESP32_GPIO_11 = MOSI (Master Out Slave In)
ESP32_GPIO_12 = SCLK (Serial Clock)
ESP32_GPIO_13 = CS   (Chip Select - Active Low)
ESP32_GPIO_14 = DC   (Data/Command Select)
ESP32_GPIO_15 = RST  (Hardware Reset)

[I2S Audio Bus]
ESP32_GPIO_4  = BCLK  (Bit Clock)
ESP32_GPIO_5  = LRCK  (Left/Right Channel Clock)
ESP32_GPIO_6  = DIN   (Data Input)

[Cherry MX Buttons]
ESP32_GPIO_35 = UP_BUTTON
ESP32_GPIO_36 = DOWN_BUTTON
ESP32_GPIO_37 = LEFT_BUTTON
ESP32_GPIO_38 = RIGHT_BUTTON
ESP32_GPIO_39 = ACTION_A
ESP32_GPIO_40 = ACTION_B
```

---

### Designing the Enclosure

For the case, I designed a custom two-part brutalist shell in Blender and printed it on a Creality Ender 3. 

I opted for matte black PLA plastic with exposed structural M3 hex screws to emphasize the brutalist, blocky aesthetic. The mechanical switches sit in custom-molded square sockets, giving the face of the console a tactile, rugged appeal.

```
       ___________________________________________
      /   [___]   TECTONIC HANDHELD v1.2   [___]  \
     /_____________________________________________\
     |                                             |
     |   +-------------------------------------+   |
     |   |                                     |   |
     |   |       ST7789 2.8" LCD SCREEN        |   |
     |   |              320 x 240              |   |
     |   |                                     |   |
     |   +-------------------------------------+   |
     |                                             |
     |        [UP]                  [ Cherry MX ]  |
     |     [L]    [R]                 A       B    |
     |       [DOWN]                 [O]     [O]    |
     |_____________________________________________|
```

---

### Battery Life and Power Analysis

A primary concern was ensuring at least 4 hours of gameplay under full CPU and screen backlight load. Let's look at the average current draw across components:

| Component | Active Current | Voltage | Power Consumption |
| :--- | :--- | :--- | :--- |
| **ESP32-S3 (Dual Core @ 240MHz)** | $120\text{ mA}$ | $3.3\text{ V}$ | $396\text{ mW}$ |
| **ST7789 Backlight (100% Brightness)** | $60\text{ mA}$ | $3.3\text{ V}$ | $198\text{ mW}$ |
| **MAX98357A I2S DAC (Max Vol)** | $70\text{ mA}$ | $5.0\text{ V}$ | $350\text{ mW}$ |
| **Total Overhead** | $\approx 250\text{ mA}$ | — | $\approx 944\text{ mW}$ |

With a $1200\text{ mAh}$ cell operating at an average discharge voltage of $3.7\text{ V}$, the total capacity is $4.44\text{ Wh}$.

$$\text{Estimated Runtime} = \frac{4.44\text{ Wh}}{0.944\text{ W}} \approx 4.7\text{ Hours}$$

This exceeds the target runtime cleanly! The next steps are to design a clean double-sided PCB in KiCad and order a small batch for a consolidated, solder-free console assembly.
