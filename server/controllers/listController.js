const { error } = require('console');
const List = require('../models/listModel')
const mongoose = require('mongoose')

// Get all lists
const getAllLists = async (req, res) => {
    const lists = await List.find({}).sort({createdAt: -1});
    res.status(200).json(lists);
}

// Get a single list
const getSingleList = async (req, res) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such list'})
    }
    const list = await List.findById(id)
    if (!list){
        return res.status(400).json({error: 'No such list'})
    }

    res.status(200).json(list);

}

// Create a List
const createList = async (req, res) => {
    const {title, tasks} = req.body;
    let emptyFields = []
    if (!title){
        emptyFields.push("title")
    }

    if (emptyFields.length > 0){
        return res.status(400).json({error: `Please provide ${emptyFields.join(', ')}`})
    }

    // add doc to db
    try {
        const newList = await List.create({title, tasks});
        res.status(200).json(newList)
    }
    catch (error){
        res.status(400).json({error: error.message})
    }
}

// Update the list
const updateList = async (req, res) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such list'})
    }
    const list = await List.findOneAndUpdate({_id : id}, {
        ...req.body // spread the request body to update the list
    },
    {new: true});

    if(!list) {return res.status(400).json({error: 'No such list'})}

    res.status(200).json(list)
}

// Delete the list
const deleteList = async (req, res) => {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
        { return res.status(400).json({error: 'No such list'})};
    const list = await List.findByIdAndDelete({_id: id});

    if (!list){
        return res.status(400).json({error: 'No such list'});
    }

    res.status(200).json(list)

}

module.exports = {
    getAllLists,
    getSingleList,
    createList,
    updateList,
    deleteList
}