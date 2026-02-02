import fs from 'fs';
import express from 'express';

const app = express();
app.use(express.json());

const FILE = 'data.json';

/* =======================
   Utility Functions
======================= */

// Read students from file
const readStudents = () => {
  try {
    if (!fs.existsSync(FILE)) return [];
    const data = fs.readFileSync(FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

// Write students to file
const writeStudents = (students) => {
  fs.writeFileSync(FILE, JSON.stringify(students, null, 2));
};

/* =======================
   API Endpoints
======================= */

// POST /students → Add new student
app.post('/students', (req, res) => {
  const { id, name, email, course } = req.body;

  if (!id || !name || !email || !course) {
    return res.status(400).send('All fields are required');
  }

  const students = readStudents();

  if (students.find(s => s.id == id)) {
    return res.status(409).send('Student already exists');
  }

  students.push({ id, name, email, course });
  writeStudents(students);

  res.status(201).send('Student added successfully');
});

// GET /students → Get all students
app.get('/students', (req, res) => {
  res.json(readStudents());
});

// GET /students/:id → Get student by ID
app.get('/students/:id', (req, res) => {
  const students = readStudents();
  const student = students.find(s => s.id == req.params.id);

  if (!student) {
    return res.status(404).send('Student not found');
  }

  res.json(student);
});

// PUT /students/:id → Update full student
app.put('/students/:id', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id == req.params.id);

  if (index === -1) {
    return res.status(404).send('Student not found');
  }

  students[index] = { ...students[index], ...req.body };
  writeStudents(students);

  res.send('Student updated successfully');
});

// PATCH /students/:id/course → Update only course
app.patch('/students/:id/course', (req, res) => {
  const { course } = req.body;
  if (!course) {
    return res.status(400).send('Course is required');
  }

  const students = readStudents();
  const student = students.find(s => s.id == req.params.id);

  if (!student) {
    return res.status(404).send('Student not found');
  }

  student.course = course;
  writeStudents(students);

  res.send('Course updated successfully');
});

// DELETE /students/:id → Delete student
app.delete('/students/:id', (req, res) => {
  const students = readStudents();
  const updated = students.filter(s => s.id != req.params.id);

  if (students.length === updated.length) {
    return res.status(404).send('Student not found');
  }

  writeStudents(updated);
  res.send('Student deleted successfully');
});

/* =======================
   Start Server
======================= */

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
