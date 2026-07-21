# 🌱 JagaPokok

## Overview

JagaPokok is a cross-platform indoor plant care application built with React Native, Expo, Firebase Authentication, and Cloud Firestore.

The application helps users manage indoor plants through personal plant collections and intelligent care reminders. It combines practical plant care information with a simple and intuitive mobile experience for both beginners and plant enthusiasts.

## Why I Built JagaPokok

I enjoy gardening and caring for indoor plants, but I often found myself forgetting when I last watered or fertilized them. As my collection grew, it became difficult to keep track of each plant's care schedule.

JagaPokok was created to solve that problem. My goal was to build a simple and practical mobile application that helps plant owners organize plant care and manage care reminders in one place.

## Features

- 🌱 Indoor plant database with care information
- 📚 Scientific and common plant names
- 🌿 Basic care guides for each plant
- 💚 Plant benefits and companion suggestions
- 👤 Personal MyPokok plant collection
- ⏰ Automatic care reminders based on plant requirements
- ⚙️ Custom reminder scheduling
- 🌍 Community platform for text-based plant care posts
- ❤️ Like, comment, and share community posts
- 🔐 Persistent Firebase anonymous authentication
- 🔒 Tested Firestore security rules
- 🧪 Jest unit tests and Firestore security-rule integration tests

## Screenshots

The screenshots below show the main JagaPokok user journey, including plant discovery, plant care information, personal plant management, reminders, and community interaction.

<table>
  <tr>
    <th>Home</th>
    <th>Plant Details</th>
    <th>My Plants</th>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/screenshots/home-screen.png" width="220" alt="JagaPokok home screen">
    </td>
    <td align="center">
      <img src="assets/screenshots/plant-details.png" width="220" alt="JagaPokok plant details screen">
    </td>
    <td align="center">
      <img src="assets/screenshots/my-plants.png" width="220" alt="JagaPokok personal plant collection">
    </td>
  </tr>
  </table>
  
  <table>
  <tr>
    <th width="50%">Care Reminders</th>
    <th width="50%">Community</th>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="assets/screenshots/reminder-screen.png" width="220" alt="JagaPokok reminder screen">
    </td>
    <td align="center" width="50%">
      <img src="assets/screenshots/community-screen.png" width="220" alt="JagaPokok community screen">
    </td>
  </tr>
</table>

## 🛠 Tech Stack

| Technology              | Purpose                           |
| ----------------------- | --------------------------------- |
| React Native            | Cross-platform mobile development |
| Expo                    | Development framework             |
| Firebase Authentication | User authentication               |
| Cloud Firestore         | Database                          |
| JavaScript              | Application development           |
| Expo Router             | Navigation                        |

## 🏗 Application Architecture

JagaPokok uses Expo Router screens, reusable components, application services, and Firebase backend services.

```mermaid
flowchart TD
    A[User] --> B[React Native Screens]
    B --> C[Expo Router]

    C --> D[Authentication]
    C --> E[Plant Catalogue]
    C --> F[Care Reminders]
    C --> G[Community]

    D --> H[Firebase Authentication]
    E --> I[Cloud Firestore]
    F --> I
    G --> I
```

### Architecture Overview

- React Native screens provide the mobile user interface.
- Expo Router manages navigation between screens.
- Reusable components and service modules support application logic.
- Firebase Authentication manages persistent anonymous user sessions.
- Cloud Firestore stores plant information, user profiles, personal plant collections, reminders, and community posts.

## 📁 Folder Structure

```text
JagaPokok/
├── __tests__/             # Jest unit tests
├── app/                   # Expo Router routes and application pages
├── assets/
│   ├── images/            # Application images and visual assets
│   └── screenshots/       # Screenshots used in this README
├── components/            # Reusable user interface components
├── constants/             # Shared constants and configuration values
├── hooks/                 # Custom React hooks
├── scripts/               # Project utility scripts
├── services/              # Firebase and application service modules
├── app.json               # Expo application configuration
├── jest.config.js         # Jest test configuration
├── package.json           # Dependencies and project scripts
└── README.md              # Project documentation
```

The project separates Expo Router pages, reusable interface components, custom hooks, and service modules. This structure keeps Firebase operations and application logic separate from the user interface.

## ⚙️ Installation

### Prerequisites

Before running the project, install:

- Node.js
- npm
- Expo Go on a mobile device, or an Android or iOS emulator

### Setup

1. Clone the repository.

```bash
git clone https://github.com/AnurAfitahMI/JagaPokok.git
```

2. Open the project folder.

```bash
cd JagaPokok
```

3. Install the project dependencies.

```bash
npm install
```

4. Start the Expo development server.

```bash
npx expo start
```

5. Run the application using one of these options:

- Scan the QR code using Expo Go
- Press `a` to open the Android emulator
- Press `i` to open the iOS simulator

A Firebase project and valid Firebase configuration are required for authentication and database features.

## 💡 Lessons Learned

Building JagaPokok independently gave me experience across the full mobile application development process, from planning and database design to implementation, testing, debugging, and documentation.

Through this project, I learned how to:

- Structure a React Native application using reusable components, Expo Router routes, hooks, and service modules
- Design and manage data using Cloud Firestore
- Implement persistent anonymous authentication and Cloud Firestore data operations
- Build automatic and customizable plant care reminders
- Separate Firebase operations from user interface logic
- Test application functions using Jest
- Write and validate Firestore security rules using emulator-based integration tests
- Debug integration issues across navigation, authentication, and cloud database services
- Manage a software project within a 12-week development timeline

The project strengthened my problem-solving skills and taught me to break complex features into smaller, manageable tasks. It also reinforced the importance of clean project structure, consistent naming, testing, and technical documentation.

## 🚀 Future Development

Planned improvements for JagaPokok include:

- Add community image attachments using Firebase Storage
- Add a plant growth journal with progress photos
- Add camera and gallery input for plant identification
- Integrate AI-assisted plant recognition
- Improve reminder reliability and notification handling
- Add search and filtering for the plant database
- Expand the plant information database
- Add editing and deletion controls for community posts
- Add stronger form validation and error messages
- Expand automated tests to more application areas
- Improve accessibility and responsive layout
- Prepare the application for production deployment

## 👤 Author

Anur Afitah Mohd Isa

Diploma in Information Technology graduate from the University of Malaya with a CGPA of 3.97/4.00. I am building my career in IT, digital project delivery, and project coordination.

- GitHub: [AnurAfitahMI](https://github.com/AnurAfitahMI)
- LinkedIn: [linkedin.com/in/aam1](https://www.linkedin.com/in/aam1)
