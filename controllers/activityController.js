const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else{
           next({message: 'That filetype isn\'t allowed!'}, false);
        }
    }
}

exports.homePage = (req, res) => {
    res.render('index');
};


exports.addActivity = (req, res) => {
    res.render('editActivity', {title: 'Add Activity'});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    //check if there is no new file to resize
    if(!req.file) {
        next(); //skip to the next middleware
    } else {
        const extension = req.file.mimetype.split('/')[1];
        req.body.photo = `${uuid.v4()}.${extension}`;
        //now we resize
        const photo = await jimp.read(req.file.buffer);
        await photo.resize(800, jimp.AUTO);
        await photo.write(`./public/uploads/${req.body.photo}`);
        //once we have written the photo to our filesystem, keep going
        next();
    }
};


exports.createActivity = async (req, res) => {
    const activity = await (new Activity(req.body)).save();
    console.log("it worked!");
    req.flash('success', `Woohoo! You successfully created <strong>${activity.name}</strong>!`);
    res.redirect(`/activities/${activity.slug}`);
};

exports.getActivities = async (req, res) => {
    //Querey the DB for the list of all activities
    const activities = await Activity.find();
    res.render('activities', {title: 'Activities', activities});
};

exports.editActivity = async (req, res) => {
    //1. Find the activity given the ID
    const activity = await Activity.findOne({ _id: req.params.id });

    //2. confirm they are the owner of the activity

    //2. render the edit activity page
    res.render('editActivity', { title: `Edit ${activity.name}`, activity});
};

exports.updateActivity = async (req, res) => {
    //turn coordinates into Point
    req.body.location.type = 'Point';

    //1. find and update the activity
    const activity = await Activity.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true, //return the new activity instead of the old one
        runValidators: true
    }).exec();
    //2. redirect them to the activity and tell them it was update
    req.flash('success', `Woohoo! You successfully updated <strong>${activity.name}</strong>! <a href="/activities/${activity.slug}">View Activity</a>`);
    res.redirect(`/activities/${activity.id}/edit`);
};

exports.getActivityBySlug = async (req, res, next) => {
    //Query the DB for specific activity, given slug
    const activity = await Activity.findOne({slug: req.params.slug});
    if(!activity) return next();
    res.render('activity', {title: activity.name, activity});
    
}

exports.getActivitiesByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    //create custom fn to query DB for tags count
    const tagsPromise = Activity.getTagsList();
    const activitiesPromise = Activity.find({tags: tagQuery});

    const [tags, activities] = await Promise.all([tagsPromise, activitiesPromise]);
    
    res.render('tags', { title: 'Tags', tag, tags, activities} );
}