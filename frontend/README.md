# TODO List Frontend Using React with Vite

This project is a frontend application for a TODO list, built using React and Vite.

## Setup

To get the project running on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd task-manager-front
    ```

    _(Replace `<repository_url>` with the actual URL of your project repository)_

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
    This command will install all the necessary packages listed in the `package.json` file, including React, Vite, and other libraries.

## Environment Configuration

The application relies on an environment variable to configure the API URL. You need to create a `.env` file in the root of your project and add the following:

```env
VITE_API_URL=http://localhost:3010/api
(Replace http://localhost:3010/api with the actual URL of your backend API)
```

Vite automatically loads environment variables prefixed with VITE\_ from the .env file. You can then access this variable in your React code using import.meta.env.VITE_API_URL.

Running the Application
To start the development server, run the following command:

Bash

```
npm run dev

# or

yarn dev
```

This command will build the project and start a local development server. You can usually access the application in your web browser at http://localhost:5173 (the port might vary). Vite provides hot module replacement (HMR), so changes you make to the code will be reflected in the browser automatically without a full page reload.

Running Tests
This project uses Vitest for unit testing. To run the tests, use the following command:

Bash

```
npm run test

# or

yarn test
```

This command will execute all the test files located in your project (typically in **tests** directories or with a .spec.ts/.test.ts extension). Vitest will report the status of each test, indicating whether they passed or failed.

```
Folder Structure
task-manager-front/
├── src/
│ ├── components/
│ │ ├── Home/
│ │ │ ├── EditTaskModal.tsx
│ │ │ └── ViewTaskModal.tsx
│ │ └── ui/
│ │ ├── AlertComponent.tsx
│ │ ├── AuthCard.tsx
│ │ ├── BodyCard.tsx
│ │ ├── InputField.tsx
│ │ └── Navbar.tsx
│ ├── context/
│ │ └── AuthContext.tsx
│ ├── hooks/
│ ├── pages/
│ │ ├── home/
│ │ │ ├── Home.spec.tsx
│ │ │ └── Home.tsx
│ │ ├── login/
│ │ │ ├── Login.spec.tsx
│ │ │ └── Login.tsx
│ │ └── registration/
│ │ ├── Registration.spec.tsx
│ │ └── Registration.tsx
│ ├── routes/
│ │ ├── index.tsx
│ │ └── PrivateRoute.tsx
│ ├── services/
│ │ ├── api.ts
│ │ ├── auth.service.ts
│ │ └── tasks.service.ts
│ ├── store/
│ │ ├── alertStore.ts
│ │ └── taskStore.ts
│ ├── App.css
│ ├── App.tsx
│ ├── main.tsx
│ └── vite-env.d.ts
├── public/
├── .env
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
