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
    name: "src",
    path: "/src",
    children: [
      {
        type: "file",
        name: "App.jsx",
        path: "/src/App.jsx",
        content: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={increment}>
        Click me
      </button>
    </div>
  );
}

export default Counter;`,
      },
      {
        type: "file",
        name: "api.py",
        path: "/src/api.py",
        content: `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/status')
def get_status():
    return jsonify({"status": "ok"})

def calculate_sum(a, b):
    # This is a simple function
    result = a + b
    return result

if __name__ == '__main__':
    app.run(debug=True)
`,
      },
       {
        type: "file",
        name: "index.html",
        path: "/src/index.html",
        content: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <h1>Welcome to My Website</h1>
    <p>This is a paragraph.</p>
    
    <div class="container">
      <button id="myButton">Click Me!</button>
    </div>

    <script src="script.js"></script>

</body>
</html>
`,
      },
    ],
  },
];
