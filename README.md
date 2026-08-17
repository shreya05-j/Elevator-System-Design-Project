# Real-Time Elevator Management System (LLD)

![Tech Stack](https://img.shields.io/badge/Stack-Django_|_Next.js_|_Redis-blue)
![Architecture](https://img.shields.io/badge/Architecture-Event--Driven_|_WebSockets-green)
![Design Pattern](https://img.shields.io/badge/Design_Pattern-Strategy-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

A comprehensive System Design project showcasing Low-Level Design (LLD), real-time bi-directional networking, and advanced Object-Oriented Programming. This project simulates a multi-elevator building with real-time visual tracking and dynamic routing algorithms.

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [WebSocket Reference](#websocket-reference)
8. [Future Enhancements](#future-enhancements)
9. [License](#license)

---

## Overview
This repository contains the full-stack implementation of an Elevator Management System. It moves beyond standard CRUD applications by implementing an event-driven state machine on the backend and visualizing it in real-time on the frontend without relying on HTTP polling.

## Key Features
* **Real-Time State Synchronization:** Utilizes Django Channels and Redis to broadcast elevator movements and queue updates to the frontend via WebSockets.
* **Pluggable Routing Algorithms:** The routing logic is abstracted, allowing the system to swap algorithms on the fly without altering the core state machine.
* **Standard Routing (SCAN):** Implements the classic LOOK/SCAN algorithm for optimal passenger wait times.
* **Sus-XAI Integration:** Features a custom sustainability framework algorithm that prioritizes energy efficiency (batching requests, minimizing motor start/stops) during off-peak hours.
* **Visual Dashboard:** A sleek, minimalist Next.js interface that animates the live position of the elevators and manages asynchronous request queues.

## Architecture & Design Patterns
The core of the system is built on strict Object-Oriented principles using the **Strategy Design Pattern**:
* `Dispatcher`: The central nervous system that maintains the global state in memory and delegates floor requests.
* `Elevator`: Manages its own local state (MOVING, STOPPED, IDLE) and direction.
* `RoutingStrategy`: An interface implemented by `ScanRoutingStrategy` and `SustainableRoutingStrategy` to calculate the mathematical next-best step.

## Technology Stack
* **Backend:** Python 3.10+, Django, Django Channels, Django REST Framework
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Axios
* **Infrastructure:** Redis (Channel Layer), Docker
* **Communication:** WebSockets (ASGI)

## Project Structure
```text
elevator-system-lld/
│
├── backend/                  # Django ASGI Application
│   ├── core_logic/           # Python OOD (Dispatcher, Elevator, Strategies)
│   ├── elevator_system/      # Django app (Consumers, Routing, Views)
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                 # Next.js Application
│   ├── app/                  # App router (page.tsx, layout.tsx)
│   ├── components/           # UI Components (ElevatorShaft, Controls)
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml        # Redis container configuration
└── README.md
