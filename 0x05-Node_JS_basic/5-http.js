const http = require('http');
const fs = require('fs');
const { argv } = require('process');

// Function to count students and send the data to the response stream
function countStudents(path, res) {
  if (fs.existsSync(path)) {
    const data = fs.readFileSync(path, 'utf8').trim();
    const lines = data.split('\n').filter((line) => line.trim() !== ''); // Remove empty lines

    const result = [];
    lines.forEach((line) => {
      result.push(line.split(','));
    });

    result.shift(); // Remove the header row

    const students = [];
    result.forEach((row) => students.push([row[0], row[3]])); // [name, field]
    const fields = new Set(students.map((student) => student[1]));

    const fieldCounts = {};
    fields.forEach((field) => { fieldCounts[field] = 0; });
    students.forEach((student) => { fieldCounts[student[1]] += 1; });

    res.write(`Number of students: ${students.length}\n`);

    fields.forEach((field) => {
      const studentsInField = students.filter((student) => student[1] === field).map((student) => student[0]);
      res.write(`Number of students in ${field}: ${fieldCounts[field]}. List: ${studentsInField.join(', ')}\n`);
    });
  } else {
    throw new Error('Cannot load the database');
  }
}

// Create the HTTP server
const hostname = 'localhost';
const port = 1245;

const app = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  const { url } = req;

  if (url === '/') {
    res.write('Hello Holberton School!');
    res.end();
  } else if (url === '/students') {
    res.write('This is the list of our students\n');
    try {
      countStudents(argv[2], res);
      res.end(); // Ensure that the response ends after processing
    } catch (err) {
      res.statusCode = 500; // Set status code for error
      res.end(err.message); // Return error message if file loading fails
    }
  } else {
    res.statusCode = 404;
    res.end('Not Found'); // Handle other routes
  }
});

// Start the server and listen on port 1245
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = app;
