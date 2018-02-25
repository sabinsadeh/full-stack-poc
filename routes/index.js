const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const userController = require('../controllers/userController');

const { catchErrors } = require('../handlers/errorHandlers');

//Do work here

router.get('/', catchErrors(activityController.getActivities));
router.get('/activities', catchErrors(activityController.getActivities));

router.get('/activities/:id/edit', catchErrors(activityController.editActivity));
router.get('/activities/:slug', catchErrors(activityController.getActivityBySlug));

router.get('/add', activityController.addActivity);
router.post('/add', 
    activityController.upload, 
    catchErrors(activityController.resize),
    catchErrors(activityController.createActivity)
);
router.post('/add/:id', 
    activityController.upload, 
    catchErrors(activityController.resize),
    catchErrors(activityController.updateActivity)
);

router.get('/tags', catchErrors(activityController.getActivitiesByTag));
router.get('/tags/:tag', catchErrors(activityController.getActivitiesByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
//router.post('/login', userController.)

module.exports = router;
