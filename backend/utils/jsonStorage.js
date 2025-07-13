const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const eventsFile = path.join(dataDir, "events.json");

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readEvents = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(eventsFile)) {
      return [];
    }
    const data = fs.readFileSync(eventsFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading events:", error);
    return [];
  }
};

const writeEvents = (events) => {
  try {
    ensureDataDir();
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing events:", error);
    return false;
  }
};

module.exports = { readEvents, writeEvents };
