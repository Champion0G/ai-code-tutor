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

const reactQuiz = {
  title: "React Hooks Quiz",
  questions: [
    {
      question: "What does the `useState` hook return?",
      options: [
        "A single value",
        "An object with the current state",
        "An array with the current state and a function to update it",
        "A function to update the state",
      ],
      correctAnswer: "An array with the current state and a function to update it",
    },
    {
      question: "How do you update the state when using `useState`?",
      options: [
        "By directly modifying the state variable",
        "By calling the setter function returned by `useState`",
        "Using `this.setState`",
        "It updates automatically",
      ],
      correctAnswer: "By calling the setter function returned by `useState`",
    },
  ],
};

const pythonQuiz = {
  title: "Python Basics Quiz",
  questions: [
    {
      question: "What is a decorator in Python used for?",
      options: [
        "To style web pages",
        "To add functionality to an existing function or class",
        "To declare a new variable",
        "To import libraries",
      ],
      correctAnswer: "To add functionality to an existing function or class",
    },
  ],
};

const htmlQuiz = {
  title: "HTML Fundamentals Quiz",
  questions: [
    {
      question: "What is the purpose of the `<script>` tag?",
      options: [
        "To define a section of navigation links",
        "To embed or reference an executable script",
        "To style the document",
        "To create a hyperlink",
      ],
      correctAnswer: "To embed or reference an executable script",
    },
  ],
};

export const quizzes = {
  App: reactQuiz,
  api: pythonQuiz,
  index: htmlQuiz,
  default: reactQuiz,
};
