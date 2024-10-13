import { Types } from 'mongoose';

export const mockPendingArrangementRequest = {
    _id: new Types.ObjectId("66fe5b8756686491085b1314"),
    staff_id: 140881,
    request_date: new Date("2024-10-05T00:00:00.000Z"),
    status: "Pending",
    manager_id: 140008,
    group_id: null,
    request_time: "AM",
    reason: "Test",
    __v: 0,
};

export const mockPendingArrangementRequestSelected = [
    {
        _id: new Types.ObjectId("66fe5b8756686491085b1315"),
        staff_id: 140881,
        request_date: new Date("2024-10-05T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: null,
        request_time: "AM",
        reason: "Testing",
        __v: 0,
    },
    {
        _id: new Types.ObjectId("66fe5b8756686491085b1316"),
        staff_id: 140881,
        request_date: new Date("2024-10-06T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: null,
        request_time: "AM",
        reason: "Testing",
        __v: 0,
    },
];

export const mockPendingArrangementRequestGroup = [
    {
        _id: new Types.ObjectId("66fe5b8756686491085b1317"),
        staff_id: 140881,
        request_date: new Date("2024-10-08T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
        request_time: "AM",
        reason: "testing",
        __v: 0,
    },
    {
        _id: new Types.ObjectId("66fe5b8756686491085b1319"),
        staff_id: 140881,
        request_date: new Date("2024-10-09T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
        request_time: "AM",
        reason: "Testing",
        __v: 0,
    },
];

export const mockPendingArrangementRequestAll = [
    {
        _id: new Types.ObjectId("66fe5b8756686491085b1320"),
        staff_id: 140881,
        request_date: new Date("2024-10-05T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
        request_time: "AM",
        reason: "Testing",
        __v: 0,
    },
    {
        _id: new Types.ObjectId("66fe5b8756686491085b1321"),
        staff_id: 140881,
        request_date: new Date("2024-10-05T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: "a2e203f1-eb27-42c7-acd8-ededa216e7c8",
        request_time: "PM",
        reason: "Testing",
        __v: 0,
    },
    {
        _id: new Types.ObjectId("66fe5b8756686491085b1322"),
        staff_id: 140881,
        request_date: new Date("2024-10-06T00:00:00.000Z"),
        status: "Pending",
        manager_id: 140008,
        group_id: null,
        request_time: "AM",
        reason: "Testing",
        __v: 0,
    },
];
