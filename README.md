# CPU Scheduling Visualizer


 > <strong>Interactive visualization of FCFS and SJF (Non-Preemptive) CPU Scheduling Algorithms</strong>


---

## Overview

The **CPU Scheduling Visualizer** is a web-based interactive application that simulates classical CPU scheduling algorithms. It allows users to dynamically add processes, select an algorithm, and visualize execution using a Gantt chart along with calculated scheduling metrics.

This project is designed for students and educators to understand scheduling concepts through clear visual feedback rather than static theory.

---

## Implemented Algorithms

* **First Come First Serve (FCFS)**
* **Shortest Job First (SJF - Non-Preemptive)**

---

## Features

* Dynamic process creation
* Algorithm selection
* Automatic scheduling computation
* Gantt chart visualization
* Waiting Time calculation
* Turnaround Time calculation
* Average metrics computation
* Clean and responsive UI

---

## Tech Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Frontend   | React + TypeScript |
| Build Tool | Vite               |
| Styling    | CSS                |
| Deployment | Vercel             |

---

## How It Works

1. Add processes with:

   * Process ID
   * Arrival Time
   * Burst Time
2. Select the scheduling algorithm.
3. Execute the simulation.
4. View:

   * Gantt chart
   * Individual process metrics
   * Average Waiting Time
   * Average Turnaround Time

---

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/edwingeorgeshaji/FCFS_SJF-Scheduling-Visualizer.git

# Navigate into project folder
cd FCFS_SJF-Scheduling-Visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Project Structure

```
.
├── src/
├── .env.example
├── .gitignore
├── index.html
├── LICENSE
├── metadata.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

---

## Learning Objectives

* Understand non-preemptive scheduling strategies
* Compare FCFS vs SJF performance
* Visualize execution timelines
* Analyze average waiting and turnaround times

---

## Deployment

The project is live at:

**[https://fcfs-sjf-scheduling-visualizer.vercel.app/](https://fcfs-sjf-scheduling-visualizer.vercel.app/)**

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  Built to simplify operating system scheduling concepts through visualization.
</p>
