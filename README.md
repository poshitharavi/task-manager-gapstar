# Task Manager

This application is a full-stack task management tool built using the following technologies:

- **Backend:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Frontend:** React (with Vite)
- **Styling:** Tailwind CSS
- **Containerization:** Docker
- **API Documentation:** Swagger

## Setup Instructions

To get the Task Manager application running on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

    _(Replace `<repository_url>` with the actual URL of your project repository and `<project_directory>` with the name of the cloned folder.)_

2.  **Build and start the Docker containers:**

    Navigate into the project's root directory (if you aren't already there) and run the following command:

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker images for your frontend, backend, and database (if it's the first time running) and then start the containers.

## Accessing the Application

Once the Docker containers are up and running, you can access the application at the following addresses:

- **Login:** [http://localhost/](http://localhost/)
- **API Documentation (Swagger):** [http://localhost:3000/api-documentation](http://localhost:3000/api-documentation)

## Stopping and Removing Containers

If you need to stop and remove the Docker containers (including any persistent volumes), you can use the following command:

```bash
docker-compose down -v
```
