const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const activitySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter an activity name!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String
});

activitySchema.pre('save', async function(next){
    if(!this.isModified('name')){
        next(); //skip it
        return; //stop this function from running
    }
    this.slug = slug(this.name);
    next();
    //TODO make more resiliant to avoid duplicate slugs
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
    const activitiesWithSlug = await this.constructor.find({slug: slugRegEx});
    if(activitiesWithSlug.length){
        this.slug = `${this.slug}-${activitiesWithSlug.length + 1}`;
    }
});


activitySchema.statics.getTagsList = function () {
    return this.aggregate([
        { $unwind: '$tags'},
        { $group: { _id: '$tags', count: { $sum: 1 } }},
        { $sort: { count: -1} }
    ]);
}

module.exports = mongoose.model('Activity', activitySchema);