---
title: "Deriving Bresenham's Line-Drawing Algorithm"
date: 2026-05-22T10:00:00+05:30
description: "A mathematical breakdown of Bresenham's algorithm for grid rasterization using pure integer arithmetic."
categories: ["algorithm"]
tags: ["math", "rasterization", "c", "graphics"]
---

In the early days of computer graphics, plotting a line was one of the most performance-critical operations. Floating-point division and multiplication were extremely expensive. 

**Bresenham's Line Algorithm** solves this problem by using only addition, subtraction, and bit-shifting (multiplication by 2). This post covers the mathematical derivation and its implementation.

---

### The Mathematical Formulation

Consider a line with endpoints $(x_0, y_0)$ and $(x_1, y_1)$. The slope $m$ of the line is defined as:

$$m = \frac{\Delta y}{\Delta x} = \frac{y_1 - y_0}{x_1 - x_0}$$

We assume that the line is in the first octant, meaning the slope lies in the range $0 \le m \le 1$. For each step in the $x$ direction, the ideal $y$ coordinate increases by $m$:

$$y_{i+1} = y_i + m$$

Since display pixels are mapped to a discrete grid, we must decide at each step $x_i + 1$ whether to plot the pixel at $(x_i + 1, y_i)$ or $(x_i + 1, y_i + 1)$.

---

### The Decision Parameter

Let the mathematical line at $x_i + 1$ be $y = m(x_i + 1) + c$. The vertical distances from the mathematical line to the lower and upper pixel grid points are $d_1$ and $d_2$:

$$d_1 = y - y_i = m(x_i + 1) + c - y_i$$
$$d_2 = (y_i + 1) - y = y_i + 1 - m(x_i + 1) - c$$

The difference between these two distances is:

$$d_1 - d_2 = 2m(x_i + 1) - 2y_i + 2c - 1$$

To eliminate the fractional division in $m$, we define a decision parameter $P_i$ by multiplying by $\Delta x$:

$$P_i = \Delta x (d_1 - d_2) = 2\Delta y \cdot x_i - 2\Delta x \cdot y_i + C$$

where $C$ is a constant term:

$$C = 2\Delta y + \Delta x(2c - 1)$$

---

### Iterative Form and Integer Arithmetic

At step $i+1$, the parameter is:

$$P_{i+1} = 2\Delta y \cdot x_{i+1} - 2\Delta x \cdot y_{i+1} + C$$

Subtracting $P_i$ from $P_{i+1}$:

$$P_{i+1} - P_i = 2\Delta y(x_{i+1} - x_i) - 2\Delta x(y_{i+1} - y_i)$$

Since we increment $x$ by 1 at each step, $x_{i+1} - x_i = 1$:

$$P_{i+1} = P_i + 2\Delta y - 2\Delta x(y_{i+1} - y_i)$$

If $P_i < 0$, the mathematical line is closer to the lower pixel. We choose $y_{i+1} = y_i$, making $(y_{i+1} - y_i) = 0$:

$$P_{i+1} = P_i + 2\Delta y$$

If $P_i \ge 0$, the mathematical line is closer to the upper pixel. We choose $y_{i+1} = y_i + 1$, making $(y_{i+1} - y_i) = 1$:

$$P_{i+1} = P_i + 2\Delta y - 2\Delta x$$

The starting parameter $P_0$ is evaluated at $(x_0, y_0)$:

$$P_0 = 2\Delta y - \Delta x$$

---

### Implementation in C

Here is the entire rasterizer routine in optimized C. Notice there is not a single floating-point number:

```c
void draw_line(int x0, int y0, int x1, int y1, uint16_t color) {
    int dx = abs(x1 - x0);
    int dy = abs(y1 - y0);
    int sx = (x0 < x1) ? 1 : -1;
    int sy = (y0 < y1) ? 1 : -1;
    int err = dx - dy;

    while (1) {
        plot_pixel(x0, y0, color);
        if (x0 == x1 && y0 == y1) break;
        
        int e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}
```

This elegant algorithm represents the absolute heights of hardware-efficient graphics programming, and continues to be standard practice in low-level micro-controllers.
