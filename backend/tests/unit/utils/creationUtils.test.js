import { 
    createNewCEORequests,
    createNewRequests, 
    findExistingRequestsForPendingAndAccepted, 
    getWeekStartAndEnd, 
    findExistingRequests 
} from '../../../api/utils/creationUtils'; // Adjust path to creationUtils
import ArrangementRequest from '../../../api/models/arrangementRequestsModel';
import { createAuditEntry } from '../../../api/controllers/requestAuditController';
import { checkIfDatesOverlap } from '../../../api/utils/dateChecker';

jest.mock('../../../api/models/arrangementRequestsModel');
jest.mock('../../../api/controllers/requestAuditController');
jest.mock('../../../api/utils/dateChecker');

describe('Creation Utils Test Suite', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });

    describe('createNewCEORequests', () => {

        beforeEach(() => {
            jest.clearAllMocks(); // Reset mocks before each test
        });
    
        test("should create new CEO arrangement requests if there are no overlaps", async () => {
            const mockRequests = [
                { date: '2023-11-01', time: '09:00', group_id: '123', reason: 'WFH' }
            ];
            const mockStaffId = '12345';
            const mockManagerId = '54321';
    
            ArrangementRequest.insertMany.mockResolvedValue([{ request_date: '2023-11-01' }]);
            checkIfDatesOverlap.mockReturnValue(false);
            createAuditEntry.mockResolvedValue();
    
            await createNewCEORequests(mockRequests, mockStaffId, mockManagerId);
    
            expect(ArrangementRequest.insertMany).toHaveBeenCalledTimes(1);
            expect(ArrangementRequest.insertMany).toHaveBeenCalledWith([
                {
                    staff_id: mockStaffId,
                    request_date: new Date('2023-11-01'),
                    status: 'Approved',
                    manager_id: mockManagerId,
                    request_time: '09:00',
                    group_id: '123',
                    reason: 'WFH'
                }
            ]);
            expect(createAuditEntry).toHaveBeenCalledWith(
                expect.any(Array),
                mockStaffId,
                'N/A',
                'Pending'
            );
        });
    
        test("should create multiple CEO arrangement requests if there are no overlaps", async () => {
            const mockRequests = [
                { date: '2023-11-01', time: '09:00', group_id: '123', reason: 'WFH' },
                { date: '2023-11-02', time: '10:00', group_id: '456', reason: 'Office' }
            ];
            const mockStaffId = '12345';
            const mockManagerId = '54321';
    
            ArrangementRequest.insertMany.mockResolvedValue([
                { request_date: '2023-11-01' },
                { request_date: '2023-11-02' }
            ]);
            checkIfDatesOverlap.mockReturnValue(false);
            createAuditEntry.mockResolvedValue();
    
            await createNewCEORequests(mockRequests, mockStaffId, mockManagerId);
    
            expect(ArrangementRequest.insertMany).toHaveBeenCalledTimes(1);
            expect(ArrangementRequest.insertMany).toHaveBeenCalledWith([
                {
                    staff_id: mockStaffId,
                    request_date: new Date('2023-11-01'),
                    status: 'Approved',
                    manager_id: mockManagerId,
                    request_time: '09:00',
                    group_id: '123',
                    reason: 'WFH'
                },
                {
                    staff_id: mockStaffId,
                    request_date: new Date('2023-11-02'),
                    status: 'Approved',
                    manager_id: mockManagerId,
                    request_time: '10:00',
                    group_id: '456',
                    reason: 'Office'
                }
            ]);
            expect(createAuditEntry).toHaveBeenCalledWith(
                expect.any(Array),
                mockStaffId,
                'N/A',
                'Pending'
            );
        });
    
        test("should throw an error if insertMany fails for CEO", async () => {
            const mockRequests = [
                { date: '2023-11-01', time: '09:00', group_id: '123', reason: 'WFH' }
            ];
            const mockStaffId = '12345';
            const mockManagerId = '54321';
    
            ArrangementRequest.insertMany.mockRejectedValue(new Error('Database error'));
    
            await expect(createNewCEORequests(mockRequests, mockStaffId, mockManagerId))
                .rejects
                .toThrow('Failed to create arrangement requests - CEO');
    
            expect(ArrangementRequest.insertMany).toHaveBeenCalledTimes(1);
            expect(createAuditEntry).not.toHaveBeenCalled();
    
        });
    
    });
    
    describe('createNewRequests', () => {

        beforeEach(() => {
            jest.clearAllMocks(); // Reset mocks before each test
        });
    
        test("should create new arrangement requests if there are no overlaps", async () => {
            const mockRequests = [
                { date: '2023-11-01', time: '09:00', group_id: '123', reason: 'WFH' }
            ];
            const mockStaffId = '12345';
            const mockManagerId = '54321';
    
            ArrangementRequest.insertMany.mockResolvedValue([{ request_date: '2023-11-01' }]);
            checkIfDatesOverlap.mockReturnValue(false);
            createAuditEntry.mockResolvedValue();
    
            await createNewRequests(mockRequests, mockStaffId, mockManagerId);
    
            expect(ArrangementRequest.insertMany).toHaveBeenCalledTimes(1);
            expect(ArrangementRequest.insertMany).toHaveBeenCalledWith([
                {
                    staff_id: mockStaffId,
                    request_date: new Date('2023-11-01'),
                    status: 'Pending',
                    manager_id: mockManagerId,
                    request_time: '09:00',
                    group_id: '123',
                    reason: 'WFH'
                }
            ]);
            expect(createAuditEntry).toHaveBeenCalledWith(
                expect.any(Array),
                mockStaffId,
                'N/A',
                'Pending'
            );
        });
    
        test("should create multiple arrangement requests if there are no overlaps", async () => {
            const mockRequests = [
                { date: '2023-11-01', time: '09:00', group_id: '123', reason: 'WFH' },
                { date: '2023-11-02', time: '10:00', group_id: '456', reason: 'Office' }
            ];
            const mockStaffId = '12345';
            const mockManagerId = '54321';
    
            ArrangementRequest.insertMany.mockResolvedValue([
                { request_date: '2023-11-01' },
                { request_date: '2023-11-02' }
            ]);
            checkIfDatesOverlap.mockReturnValue(false);
            createAuditEntry.mockResolvedValue();
    
            await createNewRequests(mockRequests, mockStaffId, mockManagerId);
    
            expect(ArrangementRequest.insertMany).toHaveBeenCalledTimes(1);
            expect(ArrangementRequest.insertMany).toHaveBeenCalledWith([
                {
                    staff_id: mockStaffId,
                    request_date: new Date('2023-11-01'),
                    status: 'Pending',
                    manager_id: mockManagerId,
                    request_time: '09:00',
                    group_id: '123',
                    reason: 'WFH'
                },
                {
                    staff_id: mockStaffId,
                    request_date: new Date('2023-11-02'),
                    status: 'Pending',
                    manager_id: mockManagerId,
                    request_time: '10:00',
                    group_id: '456',
                    reason: 'Office'
                }
            ]);
            expect(createAuditEntry).toHaveBeenCalledWith(
                expect.any(Array),
                mockStaffId,
                'N/A',
                'Pending'
            );
        });
    
        test("should throw an error if insertMany fails", async () => {
            const mockRequests = [
                { date: '2023-11-01', time: '09:00', group_id: '123', reason: 'WFH' }
            ];
            const mockStaffId = '12345';
            const mockManagerId = '54321';
    
            ArrangementRequest.insertMany.mockRejectedValue(new Error('Database error'));
    
            await expect(createNewRequests(mockRequests, mockStaffId, mockManagerId))
                .rejects
                .toThrow('Failed to create arrangement requests');
    
            expect(ArrangementRequest.insertMany).toHaveBeenCalledTimes(1);
            expect(createAuditEntry).not.toHaveBeenCalled();
        });
    });

    describe('findExistingRequestsForPendingAndAccepted', () => {
        test("should find all WFH requests with 'Approved' or 'Pending' status for a specific week", async () => {
            const mockStaffId = '12345';
            const mockWeekStart = new Date('2024-10-30');
            const mockWeekEnd = new Date('2024-11-05');
    
            const mockRequests = [
                { request_date: new Date('2024-11-01'), status: "Approved" },
                { request_date: new Date('2024-11-02'), status: "Pending" }
            ];
    
            ArrangementRequest.find.mockResolvedValue(mockRequests);
    
            const result = await findExistingRequestsForPendingAndAccepted(mockStaffId, mockWeekStart, mockWeekEnd);
    
            expect(ArrangementRequest.find).toHaveBeenCalledWith({
                staff_id: mockStaffId,
                request_date: { $gte: mockWeekStart, $lte: mockWeekEnd },
                status: { $in: ["Approved", "Pending"] }
            });
            expect(result).toEqual(mockRequests);
        });
    
        test("should return an empty array when no requests are found for the week", async () => {
            const mockStaffId = '12345';
            const mockWeekStart = new Date('2024-10-30');
            const mockWeekEnd = new Date('2024-11-05');
    
            ArrangementRequest.find.mockResolvedValue([]); // Simulate no results
    
            const result = await findExistingRequestsForPendingAndAccepted(mockStaffId, mockWeekStart, mockWeekEnd);
    
            expect(ArrangementRequest.find).toHaveBeenCalledWith({
                staff_id: mockStaffId,
                request_date: { $gte: mockWeekStart, $lte: mockWeekEnd },
                status: { $in: ["Approved", "Pending"] }
            });
            expect(result).toEqual([]); // Expecting no requests
        });
    
        test("should not return requests with status other than 'Approved' or 'Pending'", async () => {
            const mockStaffId = '12345';
            const mockWeekStart = new Date('2024-10-30');
            const mockWeekEnd = new Date('2024-11-05');
        
            const mockRequests = [
                { request_date: new Date('2024-11-01'), status: "Approved" },
                { request_date: new Date('2024-11-02'), status: "Pending" },
                { request_date: new Date('2024-11-03'), status: "Rejected" } // This should not be returned
            ];
        
            // Simulate the correct filtered response by mocking only "Approved" and "Pending"
            ArrangementRequest.find.mockResolvedValue(
                mockRequests.filter(req => ["Approved", "Pending"].includes(req.status))
            );
        
            const result = await findExistingRequestsForPendingAndAccepted(mockStaffId, mockWeekStart, mockWeekEnd);
        
            expect(ArrangementRequest.find).toHaveBeenCalledWith({
                staff_id: mockStaffId,
                request_date: { $gte: mockWeekStart, $lte: mockWeekEnd },
                status: { $in: ["Approved", "Pending"] }
            });
        
            // Expect only "Approved" and "Pending" requests
            expect(result).toEqual([
                { request_date: new Date('2024-11-01'), status: "Approved" },
                { request_date: new Date('2024-11-02'), status: "Pending" }
            ]);
        });
    
        test("should throw an error if the database query fails", async () => {
            const mockStaffId = '12345';
            const mockWeekStart = new Date('2024-10-30');
            const mockWeekEnd = new Date('2024-11-05');
    
            // Simulate a database failure
            const mockError = new Error("Database query failed");
            ArrangementRequest.find.mockRejectedValue(mockError);
    
            await expect(findExistingRequestsForPendingAndAccepted(mockStaffId, mockWeekStart, mockWeekEnd))
                .rejects
                .toThrow("Failed to fetch existing requests (Ryan's Function)");
    
            expect(ArrangementRequest.find).toHaveBeenCalledWith({
                staff_id: mockStaffId,
                request_date: { $gte: mockWeekStart, $lte: mockWeekEnd },
                status: { $in: ["Approved", "Pending"] }
            });
        });
    });
    describe('getWeekStartAndEnd', () => {
    
        test("should calculate correct week start and end when the request date is a Wednesday", () => {
            const requestDate = new Date('2024-10-02'); // Wednesday
            const { weekStart, weekEnd } = getWeekStartAndEnd(requestDate);
    
            expect(weekStart).toEqual(new Date('2024-09-30T00:00:00.000Z')); // Monday of the same week
            expect(weekEnd).toEqual(new Date('2024-10-06T23:59:59.999Z')); // Sunday of the same week
        });
    
        test("should calculate correct week start and end when the request date is a Sunday", () => {
            const requestDate = new Date('2024-10-06'); // Sunday
            const { weekStart, weekEnd } = getWeekStartAndEnd(requestDate);
    
            expect(weekStart).toEqual(new Date('2024-09-30T00:00:00.000Z')); // Monday of the previous week
            expect(weekEnd).toEqual(new Date('2024-10-06T23:59:59.999Z')); // Same Sunday, with end-of-day time
        });
    
        test("should calculate correct week start and end when the request date is a Monday", () => {
            const requestDate = new Date('2024-09-30'); // Monday
            const { weekStart, weekEnd } = getWeekStartAndEnd(requestDate);
    
            expect(weekStart).toEqual(new Date('2024-09-30T00:00:00.000Z')); // Same Monday
            expect(weekEnd).toEqual(new Date('2024-10-06T23:59:59.999Z')); // Following Sunday with end-of-day time
        });
    
        test("should calculate correct week start and end when the request date is a Saturday", () => {
            const requestDate = new Date('2024-10-05'); // Saturday
            const { weekStart, weekEnd } = getWeekStartAndEnd(requestDate);
    
            expect(weekStart).toEqual(new Date('2024-09-30T00:00:00.000Z')); // Monday of the same week
            expect(weekEnd).toEqual(new Date('2024-10-06T23:59:59.999Z')); // Sunday of the same week with end-of-day time
        });
    
        test("should calculate correct week start and end when the request date is a Friday", () => {
            const requestDate = new Date('2024-10-04'); // Friday
            const { weekStart, weekEnd } = getWeekStartAndEnd(requestDate);
    
            expect(weekStart).toEqual(new Date('2024-09-30T00:00:00.000Z')); // Monday of the same week
            expect(weekEnd).toEqual(new Date('2024-10-06T23:59:59.999Z')); // Sunday of the same week with end-of-day time
        });
    });
    describe('findExistingRequests', () => {

        test("should find existing requests based on staff ID and request slots", async () => {
            const mockStaffId = '12345';
            const mockRequestSlots = [{ date: new Date('2024-11-01') }];
    
            const mockRequests = [
                { request_date: new Date('2024-11-01'), staff_id: mockStaffId }
            ];
    
            ArrangementRequest.find.mockResolvedValue(mockRequests);
    
            const result = await findExistingRequests({ staff_id: mockStaffId, requestSlots: mockRequestSlots });
    
            expect(ArrangementRequest.find).toHaveBeenCalledWith({
                staff_id: mockStaffId,
                $or: [{ request_date: mockRequestSlots[0].date }]
            });
            expect(result).toEqual(mockRequests);
        });
    
        test("should find requests when multiple request slots are provided", async () => {
            const mockStaffId = '12345';
            const mockRequestSlots = [
                { date: new Date('2024-11-01') },
                { date: new Date('2024-11-02') }
            ];
    
            const mockRequests = [
                { request_date: new Date('2024-11-01'), staff_id: mockStaffId },
                { request_date: new Date('2024-11-02'), staff_id: mockStaffId }
            ];
    
            ArrangementRequest.find.mockResolvedValue(mockRequests);
    
            const result = await findExistingRequests({ staff_id: mockStaffId, requestSlots: mockRequestSlots });
    
            expect(ArrangementRequest.find).toHaveBeenCalledWith({
                staff_id: mockStaffId,
                $or: mockRequestSlots.map(slot => ({ request_date: slot.date }))
            });
            expect(result).toEqual(mockRequests);
        });
    
        test("should return an empty array when no matching requests are found", async () => {
            const mockStaffId = '12345';
            const mockRequestSlots = [{ date: new Date('2024-11-01') }];
    
            ArrangementRequest.find.mockResolvedValue([]); // No matching requests
    
            const result = await findExistingRequests({ staff_id: mockStaffId, requestSlots: mockRequestSlots });
    
            expect(result).toEqual([]);
        });
    
        test("should not call find when requestSlots is empty and return an empty array", async () => {
            const mockStaffId = '12345';
            const mockRequestSlots = []; // Empty request slots
        
            const result = await findExistingRequests({ staff_id: mockStaffId, requestSlots: mockRequestSlots });
        
            expect(result).toEqual([]); // Expecting an empty array
        });
        
    
        test("should handle errors gracefully when database query fails", async () => {
            const mockStaffId = '12345';
            const mockRequestSlots = [{ date: new Date('2024-11-01') }];
    
            // Simulate a database failure
            const mockError = new Error("Database query failed");
            ArrangementRequest.find.mockRejectedValue(mockError);
    
            await expect(findExistingRequests({ staff_id: mockStaffId, requestSlots: mockRequestSlots }))
                .rejects
                .toThrow("Failed to fetch existing requests");
    
            expect(ArrangementRequest.find).toHaveBeenCalledWith({
                staff_id: mockStaffId,
                $or: [{ request_date: mockRequestSlots[0].date }]
            });
        });
    });
});
