const express = require('express');
const router = express.Router();
const {
    getAllLists,
    getSingleList,
    createList,
    updateList,
    deleteList
} = require('../controllers/listController');

// Routes for lists

// GET all lists
router.get('/', getAllLists);

// GET a single list
router.get('/:id', getSingleList);

// POST a new list
router.post('/', createList);

// PATCH update a list
router.patch('/:id', updateList);

// DELETE a list
router.delete('/:id', deleteList);

// Export the router
module.exports = router;