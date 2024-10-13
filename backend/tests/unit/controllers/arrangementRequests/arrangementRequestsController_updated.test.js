import { updateRequestStatus, updateIndividualRequestStatus } from '../../../../api/controllers/arrangementRequestsController';
import ArrangementRequest from '../../../../api/models/arrangementRequestsModel';
import httpMocks from 'node-mocks-http';

jest.mock('../../../../api/models/arrangementRequestsModel');

describe('ArrangementRequestsController', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  // Test for bulk withdrawal with reason
  describe('updateRequestStatus', () => {
    test('should update the status of multiple requests (happy case)', async () => {
      req.body = {
        requestIds: ['req1', 'req2'],
        status: 'Pending Withdrawal',
        withdraw_reason: 'Need to cancel',
      };

      ArrangementRequest.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await updateRequestStatus(req, res);

      expect(ArrangementRequest.updateMany).toHaveBeenCalledWith(
        { _id: { $in: req.body.requestIds } },
        { status: req.body.status, withdraw_reason: req.body.withdraw_reason }
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Requests updated successfully' });
    });

    test('should return a 400 if no request IDs are provided (negative case)', async () => {
      req.body = { requestIds: [] };

      await updateRequestStatus(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'No request IDs provided' });
    });

    test('should return a 400 if request body is missing required fields (edge case)', async () => {
      req.body = {}; // Missing required fields

      await updateRequestStatus(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'No request IDs provided' });
    });

    test('should return a 500 if there is an internal server error (negative case)', async () => {
      req.body = {
        requestIds: ['req1', 'req2'],
        status: 'Pending Withdrawal',
        withdraw_reason: 'Need to cancel',
      };

      ArrangementRequest.updateMany.mockRejectedValue(new Error('Database error'));

      await updateRequestStatus(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Internal server error' });
    });
  });

  // Test for individual request withdrawal with reason
  describe('updateIndividualRequestStatus', () => {
    test('should update the status and withdrawal reason of a single request (happy case)', async () => {
      req.params = { id: 'req1' };
      req.body = {
        status: 'Pending Withdrawal',
        withdraw_reason: 'Personal reasons',
      };

      ArrangementRequest.findByIdAndUpdate.mockResolvedValue({
        _id: 'req1',
        status: 'Pending Withdrawal',
        withdraw_reason: 'Personal reasons',
      });

      await updateIndividualRequestStatus(req, res);

      expect(ArrangementRequest.findByIdAndUpdate).toHaveBeenCalledWith(
        'req1',
        { status: req.body.status, withdraw_reason: req.body.withdraw_reason },
        { new: true }
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        _id: 'req1',
        status: 'Pending Withdrawal',
        withdraw_reason: 'Personal reasons',
      });
    });

    test('should return a 400 if withdraw_reason is not provided (negative case)', async () => {
      req.params = { id: 'req1' };
      req.body = { status: 'Pending Withdrawal' }; // Missing withdraw_reason

      await updateIndividualRequestStatus(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: 'Cancellation reason or manager reason cannot be empty',
      });
    });

    test('should return a 404 if the request is not found (negative case)', async () => {
      req.params = { id: 'req1' };
      req.body = {
        status: 'Pending Withdrawal',
        withdraw_reason: 'Personal',
      };

      ArrangementRequest.findByIdAndUpdate.mockResolvedValue(null); // Request not found

      await updateIndividualRequestStatus(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Request not found' });
    });





    test('should return a 500 if there is an internal server error (negative case)', async () => {
      req.params = { id: 'req1' };
      req.body = {
        status: 'Pending Withdrawal',
        withdraw_reason: 'Personal reasons',
      };

      ArrangementRequest.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      await updateIndividualRequestStatus(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Internal server error' });
    });
  });
});
