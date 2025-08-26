export interface FileNode {
  type: "file" | "folder";
  name: string;
  path: string;
  content?: string;
  children?: FileNode[];
}

export const fileTree: FileNode[] = [
  {
    type: "folder",
    name: "simple-website",
    path: "/simple-website",
    children: [
      {
        type: "file",
        name: "README.md",
        path: "/simple-website/README.md",
        content: `# Simple Website

This is a basic example of a website with HTML, CSS, and JavaScript.

- \`index.html\`: The main structure of the webpage.
- \`style.css\`: Contains the styles for the webpage.
- \`script.js\`: Includes the interactive JavaScript functionality.
`,
      },
      {
        type: "file",
        name: "index.html",
        path: "/simple-website/index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Interactive Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Welcome!</h1>
    </header>
    <main>
        <div class="card">
            <h2>Click the Button!</h2>
            <p>The button below will change the text of this paragraph.</p>
            <p id="message">Hello there!</p>
            <button id="changeTextBtn">Change Text</button>
        </div>
    </main>
    <script src="script.js"></script>
</body>
</html>`,
      },
      {
        type: "file",
        name: "style.css",
        path: "/simple-website/style.css",
        content: `body {
    font-family: sans-serif;
    background-color: #f0f2f5;
    color: #333;
    margin: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    padding: 24px;
    text-align: center;
    max-width: 400px;
}

h2 {
    color: #1a73e8;
}

button {
    background-color: #1a73e8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
}

button:hover {
    background-color: #1558b3;
}
`,
      },
      {
        type: "file",
        name: "script.js",
        path: "/simple-website/script.js",
        content: `document.addEventListener('DOMContentLoaded', function() {
    // Get references to the button and the message paragraph
    const changeTextBtn = document.getElementById('changeTextBtn');
    const message = document.getElementById('message');

    // Array of possible messages
    const messages = [
        "You clicked the button!",
        "Hello, World!",
        "Keep clicking!",
        "This is fun!",
        "JavaScript is running!"
    ];

    // Add a click event listener to the button
    changeTextBtn.addEventListener('click', function() {
        // Get a random message from the array
        const randomIndex = Math.floor(Math.random() * messages.length);
        const randomMessage = messages[randomIndex];

        // Update the text content of the message paragraph
        message.textContent = randomMessage;
    });
});`,
      },
    ],
  },
];
