require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const Todo = require('./models/Todo');
const todoRoutes = require('./routes/todoRoutes');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

//Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secretKey123',
    resave: false,
    saveUninitialized: true
}))

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});
// Set
app.set('view engine', 'ejs');



// Routes
app.use('/api', todoRoutes);

app.get('/', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.render('index', { todos });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/add', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || title.trim() === '') {
            req.flash('error_msg', 'Task title is required.');
            return res.redirect('/')
        }
        await Todo.create({ title });
        req.flash('success_msg', 'Task added successfully!');
        res.redirect('/');
    }
    catch (error) {
        req.flash('error_msg', 'Error adding task.');
        res.redirect('/');
    }
});

app.get('/complete/:id', async (req, res) => {
    try {
        await Todo.findByIdAndUpdate(req.params.id, { completed: true });
        req.flash('success_msg', 'Task marked as completed!');
        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', 'Error completing task');
        res.redirect('/')
    }
});

app.get('/delete/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Task deleted successfully!')
        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', 'Error deleting task.');
        res.redirect('/');
    }
});

app.get('/task/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            req.flash('error_msg', 'Task not found.');
            return res.redirect('/');
        }
        res.render('taskDetail', { todo });
    } catch (error) {
        req.flash('error_msg', 'Error fetching task details.');
        res.redirect('/');
    }
});

app.get('/test-todo', async (req, res) => {
    try {
        const newTodo = await Todo.create({
            title: 'Learn MERNStack'
        })
        res.json(newTodo)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/edit/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            req.flash('error_msg', 'Task not found.');
            return res.redirect('/');
        }
        res.render('editTask', { todo });
    } catch (error) {
        req.flash('error_msg', 'Error loading edit page.');
        res.redirect('/');
    }
})

app.post('/edit/:id', async (req, res) => {
    try {
        const { title, completed } = req.body;
        const updatedTask = await Todo.findByIdAndUpdate(req.params.id, {
            title,
            completed: completed === 'on' // Convert checkbox value to boolean
        }, { new: true });

        if (!updatedTask) {
            req.flash('error_msg', 'Task not found.');
            return res.redirect('/');
        }

        req.flash('success_msg', 'Task updated successfully!');
        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', 'Error updating task.');
        res.redirect('/');
    }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})