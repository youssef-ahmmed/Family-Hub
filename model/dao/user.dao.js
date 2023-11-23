require('dotenv').config();
// const { date } = require('joi');
const bcrypt = require('bcrypt');
const { prisma } = require('../client.db');
const { deleteFeedByFeedId } = require('./common/deleteFeedById');
const { validateCircleId } = require('./common/validateCircleId')

class UsersDao {

    async createUser(userDto) {
        userDto.birthdate = new Date(userDto.birthdate).toISOString();
        userDto.password = bcrypt.hashSync(userDto.password, Number(process.env.SECRET));

        const email = await prisma.users.findUnique({
            where: {
                email: userDto.email
            }
        });
        if (email) throw new Error('Email is already in use.');

        const user = await prisma.users.create({
            data: userDto
        });

        return user;
    }

    async getUsersByCircleId(userDto) {
        const users = await prisma.users.findMany({
            where: {
                circleId: userDto.circleId,
                deleted: false
            }
        });

        return users;
    }

    async getUserById(userDto) {
        await validateCircleId(userDto.circleId);

        const user = await prisma.users.findUnique({
            where: {
                id: userDto.id,
                circleId: userDto.circleId,
                deleted: false,
            },
            include: {
                feeds: true,
                comments: true,
                likes: true
            }
        });

        return user;
    }

    async updateUserById(userDto) {
        await validateCircleId(userDto.circleId);

        await prisma.users.update({
            where: {
                id: userDto.id,
                circleId: userDto.circleId,
                deleted: false
            },
            data: userDto
        });
    }

    async deleteUserById(userDto) {
        await validateCircleId(userDto.circleId);
        await this.deleteFeedsByUserId(userDto.id);

        await prisma.users.update({
            where: {
                id: userDto.id,
            },
            data: {
                deleted: true
            }
        });
    }

    async deleteFeedsByUserId(userId) {
        const feedsIds = await prisma.feeds.findMany({
            select: {
                id: true
            },
            where: {
                userId: userId,
                deleted: false
            }
        });

        const feedsIdsList = feedsIds.map((feed) => feed.id);

        feedsIdsList.forEach(async feedId => {
            await deleteFeedByFeedId(feedId);
        });
    }

}

module.exports = { UsersDao };