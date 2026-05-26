---
title: "My Projects"
layout: "projects"
description: "A showcase of open source hardware, compiler experiments, and low-level software engines."
---

Welcome to my project vault. These are the tools, engines, and devices I have built, all adhering to the principles of simplicity, low overhead, and retro design.

---

### 🕹️ 1. Tectonic-Handheld
*Custom 8-bit Handheld Gaming Console*

A homebrew console built around the **ESP32-S3** microcontroller, complete with a custom PCB, tactile mechanical switches, and a 3D-printed brutalist enclosure.

* **Repository**: `github.com/ghostdsb/tectonic-handheld`
* **Status**: `Active` (v1.2 Released)
* **Stack**: C/C++, FreeRTOS, SPI TFT Driver
* **Highlights**:
  - Achieved a stable **60 FPS** render loop with dirty-rect list optimization.
  - Squeezed memory usage down to **128KB SRAM** for sprites and assets.
  - Implemented custom audio synthesizers using dual DAC outputs.

---

### 🌐 2. Retro-Net
*High-Throughput WebSocket Server for Retro Multiplayer*

An ultra-lightweight WebSocket server written in Go, specifically optimized for synchronous game-state replication across multiple 8-bit clients.

* **Repository**: `github.com/ghostdsb/retro-net`
* **Status**: `Maintained`
* **Stack**: Go, Redis, WebSockets, Epoll (Linux)
* **Highlights**:
  - Handles **100,000+** concurrent connections with minimal memory footprint.
  - Incorporates Redis-backed CSRF caching for client authentication.
  - Sub-millisecond latency using a customized packet-framing encoder.

---

### 📐 3. Tectonic-Engine
*Software Rasterizer & Ray-Caster in Vanilla C*

A software-only 3D rendering engine built from scratch. It uses no external graphics API (no OpenGL, no WebGL)—just pure mathematical projection to a raw pixel buffer.

* **Repository**: `github.com/ghostdsb/tectonic-engine`
* **Status**: `Completed`
* **Stack**: C99, Makefile, SDL2 (solely for window creation and pixel buffer swapping)
* **Highlights**:
  - Employs Bresenham's and DDA algorithms for rapid edge-interpolation.
  - Integrated custom fixed-point trigonometric lookups to bypass floating-point hardware constraints.
  - Retro pixel-art texture mapper with basic depth shading.

---

### 📦 4. Hugo Theme: Tectonic
*A Premium Retro-Brutalist Mono-Spaced Blog & Portfolio Theme*

Well, you are looking at it right now! Tectonic is designed for coders who want their websites to look like an interactive, retro-brutalist computer terminal.

* **Repository**: `github.com/ghostdsb/hugo-theme-tectonic`
* **Status**: `Active`
* **Stack**: GoTemplates, Pure Vanilla CSS, Modern JavaScript
* **Highlights**:
  - No bloated CSS frameworks; pure, handcrafted retro-brutalist stylesheets.
  - Seamless Light/Dark theme toggling without "theme flash".
  - Built-in, theme-aware KaTeX (LaTeX) and Mermaid JS support.
