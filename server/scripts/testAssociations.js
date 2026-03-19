const { User, Event } = require('../models');

async function test() {
  const user = await User.create({ name: 'Alice', email: 'alice@mail.com', password_hash: 'xxx', role: 'participant' });
  const event = await Event.create({ title: 'Event 1', organizer_id: user.id });
  const eventsOfUser = await user.getOrganizedEvents();
  console.log(eventsOfUser);
}

test();
