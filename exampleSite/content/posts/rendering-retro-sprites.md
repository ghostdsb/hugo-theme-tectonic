---
title: "Rendering Retro Sprites on Monochromatic LCDs"
date: 2026-05-21T10:00:00+05:30
description: "Optimizing 2D sprite rendering routines for small SPI displays and embedded microcontrollers."
categories: ["gaming"]
tags: ["retro", "hardware", "c", "graphics"]
---

When building retro hand-held hardware using microcontrollers (such as the ESP32), we are constrained by SPI bandwidth and limited SRAM. Sending a full framebuffer (e.g., $320 \times 240$ at 16-bit color is $153.6\text{ KB}$) at 60 FPS requires over **73.7 Mbps** of continuous SPI throughput.

This post walks through compiling a lean, high-efficiency sprite drawer in pure C that renders directly to local page buffers, bypassing standard double-buffering.

---

### The Dirty Rectangle Strategy

Instead of drawing the entire screen, we keep track of the bounding boxes of moving elements—our "dirty rectangles". We only re-draw and send the pixels within these boundaries to the display controller via SPI.

Here is a simplified structure representing a dirty rectangle:

```c
typedef struct {
    uint16_t x;
    uint16_t y;
    uint16_t width;
    uint16_t height;
} DirtyRect_t;
```

---

### Sprite Blitting with Transparency

To draw a sprite with standard chroma-key transparency (e.g., color `0x0000` is transparent), we scan through the sprite's pixel data. If the pixel is not transparent, we write it directly to our memory-mapped display area.

```c
void draw_sprite(int16_t x, int16_t y, const uint16_t *sprite, uint8_t w, uint8_t h) {
    for (uint8_t row = 0; row < h; row++) {
        int16_t screen_y = y + row;
        if (screen_y < 0 || screen_y >= SCREEN_HEIGHT) continue;

        for (uint8_t col = 0; col < w; col++) {
            int16_t screen_x = x + col;
            if (screen_x < 0 || screen_x >= SCREEN_WIDTH) continue;

            uint16_t color = sprite[row * w + col];
            if (color != TRANSPARENT_COLOR) {
                // Write pixel into the local line buffer
                write_pixel(screen_x, screen_y, color);
            }
        }
    }
}
```

---

### Embedded Optimizations

1. **Fixed-Point Lookup Tables (LUTs)**: Avoid floating-point arithmetic inside rendering loops. Convert degrees to 8-bit integers ($0\text{-}255$) and pre-calculate sine/cosine tables.
2. **Direct Memory Access (DMA)**: Configure the SPI host to use DMA channels. This lets the CPU compute the next frame's coordinates while the hardware is actively transmitting the current dirty pixel block.
3. **Loop Unrolling**: Unroll sprite copying loops where sprite sizes are fixed (e.g., $8 \times 8$ or $16 \times 16$) to eliminate branch checking overheads inside hot execution loops.

By restricting updates to changing pixel blocks, we can comfortably achieve a solid **60 FPS** on SPI-driven retro systems with CPU cycles to spare!
