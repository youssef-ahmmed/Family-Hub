const asyncHandler = require('express-async-handler');

const { EventsDao } = require('../model/dao/event.dao');
const { EventsDto } = require('../model/dto/event.dto');
const { FeedsDto } = require('../model/dto/feed.dto');
const { EventsValidator } = require('../validations/event.validation')


class EventsController {

    /**
     * @desc create a new event
     * @route /api/v1/circles/:circle_id/users/:userId/events
     * @method event
     * @access public
     */
    static createEvent = asyncHandler(async (req, res) => {

        const feedDto =  new FeedsDto({circleId: req.params.circleId, userId: req.params.userId})

        const eventDto = new EventsDto(req.body);
        const error = EventsValidator.createEvent(eventDto);

        if (error && error.error && error.error.details && error.error.details[0]) {
            res.status(400).json({ message: error.error.details[0].message });
        }
        
        const eventDao = new EventsDao();
        try {
            const event = await eventDao.createEvent(eventDto, feedDto);
            res.status(201).json(event);
        } catch (err) {
            console.log(err)
            const prefixes = ['Circle', 'Event'];
            if (prefixes.some(prefix => err.message.startsWith(prefix))) {
              res.status(409).json({ message: err.message });
            }

            res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    /**
     * @desc get all events by circle id
     * @route /api/v1/circles/:circleId/events/
     * @method GET
     * @access public
     */
    static getEventsByCircleId = asyncHandler(async (req, res) => {
        const eventDto = new EventsDto(req.body);
        eventDto.circleId = req.params.circleId;

        const eventDao = new EventsDao();

        try {
            const events = await eventDao.getEventsByCircleId(eventDto);
            res.status(200).json(events);  
        } catch (err) {
            if (err.message === 'Circle Id is invalid.') res.status(404).json({ message: err.message});
            res.status(500).json({ message: 'Internal Server Error' });
        } 
    });

    /**
     * @desc get event by id
     * @route /api/v1/circles/:circleId/events/:eventId
     * @method GET
     * @access public
     */
        static getEventById = asyncHandler(async (req, res) => {
            const eventDto = new EventsDto(req.body);
            eventDto.circleId = req.params.circleId;
            eventDto.id = req.params.eventId;
    
            const eventDao = new EventsDao();
    
            try {
                const events = await eventDao.getEventById(eventDto);
                res.status(200).json(events);  
            } catch (err) {
                const prefixes = ['Circle', 'User', 'Feed', 'Event'];
                if (prefixes.some(prefix => err.message.startsWith(prefix))) {
                res.status(409).json({ message: err.message });
                }
            }
        });

    /**
     * @desc update event by id
     * @route /api/v1/circles/:circleId/feeds/:feedId/events/:eventId
     * @method PUT
     * @access public
     */
    static updateEventById = asyncHandler(async (req, res) => {
        const feedDto = new FeedsDto({ 
            id: req.params.feedId,
            circleId: req.params.circleId,
        });

        const eventDto = new EventsDto(req.body);
        eventDto.feedId = req.params.feedId;
        eventDto.id = req.params.eventId;

        const error = EventsValidator.updateEvent(eventDto);
        if (error && error.error && error.error.details && error.error.details[0]) {
            res.status(400).json({ message: error.error.details[0].message });
        }

        const eventDao = new EventsDao();
        try {
            await eventDao.updateEventById(eventDto, feedDto);
            res.status(201).json({ message: 'event updated successfully' }); ;
        } catch (err) {
            const prefixes = ['Circle', 'User', 'Feed', 'event'];
            if (prefixes.some(prefix => err.message.startsWith(prefix))) {
              res.status(409).json({ message: err.message });
            }

            res.status(500).json({ message: 'Internal Server Error' });   
        }
    });
}

module.exports = { EventsController }