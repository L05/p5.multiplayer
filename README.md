# Sockets_p5js

This repository contains a set of template files for building a multi-device, multiplayer game where multiple clients can connect to a specified host page. The clients and hosts are built using *[p5.js](https://p5js.org)*, and they communicate with each other through a *node.js* server via *[socket.io](https://socket.io/)* messages.

![An example image of the base project in action. It shows a host window on the left side of a screen populated by two colored squares, each matching client controller windows on the right side of the screen.](data/example.png)

## Getting Started

1. Clone this GitHub repo on your local machine.

2. If you don't already have *node.js* installed on your machine, go [here](https://nodejs.org/en/download/) and download the version appropriate for your operating system.

3. Open a terminal window and navigate to the project directory.

4. Run the command `npm install`.

5. Next, run the command `node server.js` to start a *node.js* server.

6. Open a second terminal window and navigate to the `public` folder within the project directory.

7. Run `http-server -c-1` to start server. This will default to port *8080*.

8. Open a browser and go to `http://127.0.0.1:8080/host.html`. This will open up a host page. Make note of the URL displayed in the bottom left corner of the screen.

9. Open a second browser and go to the URL displayed on your host page. It will look something like `http://127.0.0.1:8080/index.html?=roomId`, where `roomId` is a randomly generated name. This screen will load a controller that let's you control the movement of a colored square on the host page.

10. You can specify your own room ID by opening a host page using `http://127.0.0.1:8080/host.html?=roomId`, where `roomId` is a string of your choice.

## Deploying to Heroku

1. Make sure to first follow at least steps 1 through 4 in [Getting Started](#getting-started).

2. Create a free [Heroku](https://heroku.com) account if you don't already have one.

3. Open a terminal window and navigate to the project directory.

4. Create a Heroku app by running the command `heroku create yourservername`, replacing `yourservername` with a server name of your choice.

4. In your `host.js` and `index.js` files, set `const local = false` as you will be running these using a remote server. Then change `const serverIp = 'https://yourservername.herokuapp.com';` to match your Heroku server address.

5. Commit these updates. In the terminal, run the command `git add -a -m "Updating for Heroku deployment"`.

6. Next, in the terminal run the command `git push heroku master`. This will push your code to the remote Heroku server.

7. Open a browser window and go to `https://yourservername.herokuapp.com/host.html`, replacing `yourservername` with the server name you selected in step 4. You should see a "host" screen with *# players* in the top left of the window and a URL displayed in the bottom left corner. Make note of this URL.

8. In a second browser window, go to the aforementioned URL. You should see a "client" screen displaying a simple controller that lets you control a colored square in your "host" screen.