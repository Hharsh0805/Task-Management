const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const newTask = new Task({ title, user: req.userId });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Error creating task' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.userId },
      { title },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Error updating task' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.userId });
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

module.exports = router;