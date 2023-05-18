const express = require('express');
const { User, UserBio } = require('../../database/models');

const dashboardRouter = express.Router();

dashboardRouter.get('/', function(req, res) {
    res.redirect('/dashboard/login');
})

dashboardRouter.get('/dashboard/login', function(req, res) {
    res.render('dashboard/login');
});

dashboardRouter.get('/dashboard/home', async function(req, res) {
    const users = await User.findAll({
        include: {
            model: UserBio,
            as: 'bio',
        },
    });

    console.log(users);
    res.render('dashboard/home', {
        users,
    });
});

dashboardRouter.get('/dashboard/users/create', function(req, res) {
    res.render('dashboard/users/create');
});

dashboardRouter.get('/dashboard/users/:id/update', function(req, res) {
    const id = req.params.id;

    res.render('dashboard/users/update');
});

dashboardRouter.get('/dashboard/users/:id/delete', function(req, res) {
    const id = req.params.id;

    res.render('dashboard/users/delete');
});

module.exports = dashboardRouter;
