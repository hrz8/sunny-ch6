const express = require('express');

const { User } = require('../../database/models');
const { UserBio } = require('../../database/models');

const userRouter = express.Router();

// POST: /form-dashboard/users/login
// endpoint yang bertugas menerima data login form dari halaman dashboard/login
userRouter.post('/form-dashboard/users/login', async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({
        where: {
            username: username,
            password: password,
            role: 'ADMIN',
        },
    });

    if (!user) {
        res.redirect('/dashboard/login');

        return;
    }

    res.redirect('/dashboard/home');
});

// POST: /form-dashboard/users/create
// endpoint yang bertugas menerima data new user dari halaman dashboard create user
userRouter.post('/form-dashboard/users/create', async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const address = req.body.address;
    const hobby = req.body.hobby;

    const created = await User.create({
        username,
        password,
        role: 'PLAYER',
    });

    await UserBio.create({
        user_id: created.id,
        first_name: firstName,
        last_name: lastName,
        address,
        hobby,
    });

    res.redirect('/dashboard/home');
});

// POST: /form-dashboard/users/update
// endpoint yang bertugas menerima data updated user dari halaman dashboard update user
userRouter.post('/form-dashboard/users/update', async function(req, res) {
    const id = req.body.user_id;
    const username = req.body.username;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const address = req.body.address;
    const hobby = req.body.hobby;

    // await User.update({
    //     username,
    // }, {
    //     where: {
    //         id,
    //     },
    // });

    await UserBio.update({
        first_name: firstName,
        last_name: lastName,
        address,
        hobby,
    }, {
        where: {
            user_id: id,
        },
    });

    res.redirect('/dashboard/home');
});

// POST: /form-dashboard/users/delete
userRouter.post('/form-dashboard/users/delete', async function(req, res) {
    const id = req.body.user_id;

    await UserBio.destroy({
        where: {
            user_id: id,
        },
    });
    await User.destroy({
        where: {
            id,
        },
    });

    res.redirect('/dashboard/home');
});

// GET: /api/v1/users -> list user
userRouter.get('/api/v1/users', async function(req, res) {
    const users = await User.findAll({
        include: {
            model: UserBio,
            as: 'bio',
        },
        order: [
            ['id', 'ASC'],
        ],
    });

    res.json({
        message: 'success fetch user data',
        result: users.map(function(user) {
            return {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: `${user.bio.first_name} ${user.bio.last_name}`,
                hobby: user.bio.hobby,
                address: user.bio.address,
            }
        }),
        error: null,
    });
});

// GET: /api/v1/users/:id -> detail user
userRouter.get('/api/v1/users/:id', async function(req, res) {
    const id = req.params.id;

    const currentUser = await User.findOne({
        where: {
            id,
        },
        include: {
            model: UserBio,
            as: 'bio',
        },
    });

    if (!currentUser) {
        res.status(404);
        res.json({
            message: 'error when get user detail',
            result: null,
            error: 'user with that id is not found'
        });

        return;
    }

    res.json({
        message: 'success get user detail',
        result: {
            id: currentUser.id,
            username: currentUser.username,
            role: currentUser.role,
            full_name: `${currentUser.bio.first_name} ${currentUser.bio.last_name}`,
            hobby: currentUser.bio.hobby,
            address: currentUser.bio.address,
        },
        error: null,
    });
});

// POST: /api/v1/users -> create user
userRouter.post('/api/v1/users', async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const address = req.body.address;
    const hobby = req.body.hobby;

    const created = await User.create({
        username,
        password,
        role: 'PLAYER',
    });

    await UserBio.create({
        user_id: created.id,
        first_name: firstName,
        last_name: lastName,
        address,
        hobby,
    });

    res.json({
        message: 'success create new user',
        result: created,
        error: null,
    });
});

// PUT: /api/v1/users/:id -> update user
userRouter.put('/api/v1/users/:id', async function(req, res) {
    const id = req.params.id;
    const username = req.body.username;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const address = req.body.address;
    const hobby = req.body.hobby;

    const updated = await UserBio.update({
        first_name: firstName,
        last_name: lastName,
        address,
        hobby,
    }, {
        where: {
            user_id: id,
        },
    });

    res.json({
        message: 'success update user',
        result: updated,
        error: null,
    });
});

// DELETE: /api/v1/users/:id -> delete user
userRouter.delete('/api/v1/users/:id', async function(req, res) {
    const id = req.params.id;

    const currentUser = await User.findOne({
        where: {
            id: id,
        }
    });

    if (!currentUser) {
        res.status(404);
        res.json({
            message: 'error when delete user',
            result: null,
            error: 'user with that id is not found'
        });

        return;
    }

    if (currentUser.role !== 'PLAYER') {
        res.status(400);
        res.json({
            message: 'error when delete',
            result: null,
            error: 'only user with role PLAYER can be deleted'
        });

        return;
    }

    await UserBio.destroy({
        where: {
            user_id: id
        },
    });

    await User.destroy({
        where: {
            id,
        },
    });

    res.json({
        message: 'success delete user',
        result: 1,
        error: null,
    });
});

module.exports = userRouter;
