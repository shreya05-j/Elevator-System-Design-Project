Real-Time Elevator Management System (LLD)
A comprehensive System Design project showcasing Low-Level Design (LLD), real-time bi-directional networking, and advanced Object-Oriented Programming. This project simulates a multi-elevator building with real-time visual tracking and dynamic routing algorithms.

Key Features
Real-Time State Synchronization: Utilizes Django Channels and Redis to broadcast elevator movements and queue updates to the frontend via WebSockets with zero polling.

Strategy Design Pattern: The routing logic is entirely abstracted, allowing the system to swap algorithms on the fly without altering the core state machine.

Standard Routing (SCAN): Implements the classic LOOK/SCAN algorithm for optimal passenger wait times.

Sus-XAI Integration: Features a custom sustainability framework algorithm that prioritizes energy efficiency (batching requests, minimizing motor start/stops) during off-peak hours.

Visual Dashboard: A sleek, minimalist Next.js interface that animates the live position of the elevators and manages the asynchronous request queues.

Technology Stack
Backend: Python 3, Django, Django Channels, Django REST Framework

Frontend: Next.js (App Router), TypeScript, Tailwind CSS

Infrastructure: Redis (Channel Layer), Docker
