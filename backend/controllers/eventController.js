const Event = require("../models/Event");
const { readEvents, writeEvents } = require("../utils/jsonStorage");

const saveEventController = async (req, res) => {
  try {
    const { title, date, time, description } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({
        message: "Title, date, and time are required",
        success: false,
      });
    }

    if (process.env.MONGODB_URI) {
      const newEvent = new Event({
        userId: req.user._id,
        title,
        date: new Date(date),
        time,
        description: description || "",
      });

      const savedEvent = await newEvent.save();

      return res.status(201).json({
        message: "Event saved successfully",
        data: savedEvent,
        success: true,
      });
    } else {
      const events = readEvents();
      const newEvent = {
        id: Date.now().toString(),
        userId: req.user._id.toString(),
        title,
        date,
        time,
        description: description || "",
        createdAt: new Date().toISOString(),
      };

      events.push(newEvent);

      if (writeEvents(events)) {
        return res.status(201).json({
          message: "Event saved successfully",
          data: newEvent,
          success: true,
        });
      } else {
        throw new Error("Failed to save event to file");
      }
    }
  } catch (err) {
    console.log(`Error in save Event Controller - ${err.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      success: false,
    });
  }
};

const fetchsavedEventController = async (req, res) => {
  try {
    if (process.env.MONGODB_URI) {
      const events = await Event.find({ userId: req.user._id }).sort({
        date: 1,
      });

      return res.status(200).json({
        message: "Events fetched successfully",
        data: events,
        success: true,
      });
    } else {
      const allEvents = readEvents();
      const userEvents = allEvents.filter(
        (event) => event.userId === req.user._id.toString()
      );

      return res.status(200).json({
        message: "Events fetched successfully",
        data: userEvents,
        success: true,
      });
    }
  } catch (err) {
    console.log(`Error in fetch saved event Controller - ${err.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      success: false,
    });
  }
};

module.exports = { saveEventController, fetchsavedEventController };
