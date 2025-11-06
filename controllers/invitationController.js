const Invitation = require("../models/Invitation");

const createInvitation = async (referrer, referred) => {
  return await Invitation.create({ referrer, referred });
};

const getLeaderBoard = async () => {
  const invitations = await Invitation.find().populate(
    "referrer",
    "firstName username"
  );
  let leadMap = newMap();
  invitations.forEach((i) => {
    const id = i.referrer._id.toString();
    if (leadMap.has(id)) {
      leadMap.get(id).count++;
    } else {
      leadMap.set(id, { referrer: i.referrer, count: 1 });
    }
  });
  const lead = Array.from(leadMap.values());
  return lead;
};

module.exports = { createInvitation, getLeaderBoard };
