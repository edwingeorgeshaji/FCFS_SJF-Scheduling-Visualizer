# CPU Scheduling Visualizer

<p align="center">
  <strong>Interactive visualization of FCFS and SJF (Non-Preemptive) CPU Scheduling Algorithms</strong>
</p>

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
git clone <your-repository-url>

# Navigate into project folder
cd <project-folder>

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

### File Explanation

**src/**
Contains the main application source code including React components, scheduling logic, and styling.

**index.html**
Root HTML template used by Vite to mount the React application.

**package.json**
Defines project dependencies, scripts, and metadata.

**package-lock.json**
Locks dependency versions for consistent installations.

**tsconfig.json**
TypeScript configuration for strict type checking and compilation settings.

**vite.config.ts**
Configuration file for Vite build and development server.

**.env.example**
Template for environment variables (if required in future extensions).

**metadata.json**
Project-related metadata configuration.

**LICENSE**
Specifies the legal usage terms of the project.

**.gitignore**
Defines files and folders excluded from version control.

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
