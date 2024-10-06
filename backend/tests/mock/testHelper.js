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

export const mockApprovedTempArrangementRequestDept = [
  {
    _id: new Types.ObjectId("66fb6f630fe6d6f83a634290"),
    staff_id: 140894,
    request_date: new Date("2024-10-04T00:00:00.000Z"),
    status: "Approved",
    manager_id: 140001,
    group_id: null,
    request_time: "Full Day",
    reason: "Parental leave",
    __v: 0
  },
  {
    _id: new Types.ObjectId("66fb6f630fe6d6f83a63428a"),
    staff_id: 140001,
    request_date: new Date("2024-10-02T00:00:00.000Z"),
    status: "Approved",
    manager_id: 130002,
    group_id: null,
    request_time: "PM",
    reason: "Parental leave",
    __v: 0
  },
  {
    _id: new Types.ObjectId("66fb6f630fe6d6f83a634292"),
    staff_id: 140002,
    request_date: new Date("2024-10-08T00:00:00.000Z"),
    status: "Approved",
    manager_id: 140894,
    group_id: null,
    request_time: "AM",
    reason: "Elderly care leave",
    __v: 0
  },
]
