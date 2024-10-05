import { Types } from 'mongoose';

export const mockApprovedRegularArrangementRequest = {
  _id: new Types.ObjectId("66fe5b8756686491085b1315"),
  staff_id: 140881,
  request_date: new Date("2024-10-08T00:00:00.000Z"),
  status: "Approved",
  manager_id: 140008,
  group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
  request_time: "AM",
  reason: "Childcare leave",
  __v: 0,
};

export const mockApprovedTemporaryArrangementRequest = {
  _id: new Types.ObjectId("66fe5b8756686491085b1315"),
  staff_id: 140881,
  request_date: new Date("2024-10-05T00:00:00.000Z"),
  status: "Approved",
  manager_id: 140008,
  group_id: null,
  request_time: "PM",
  reason: "Parental leave",
  __v: 0,
};
