import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

interface ExchangeRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderRole: string;
  receiverName: string;
  receiverRole: string;
  skillId: string;
  skillName: string;
  skillLevel?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

function Requests() {
  const [sentRequests, setSentRequests] = useState<ExchangeRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<
    ExchangeRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/requests");

      setSentRequests(response.data.sent || []);
      setReceivedRequests(response.data.received || []);
    } catch (err: unknown) {
      console.error("Failed to load requests:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load exchange requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const updateRequestStatus = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setProcessingId(requestId);
      setError("");
      setSuccess("");

      await api.patch(`/users/requests/${requestId}`, {
        status,
      });

      setSuccess(
        status === "accepted"
          ? "Exchange request accepted."
          : "Exchange request rejected."
      );

      await fetchRequests();
    } catch (err: unknown) {
      console.error("Failed to update request:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update exchange request."
      );
    } finally {
      setProcessingId("");
    }
  };

  const allRequests = useMemo(
    () => [...receivedRequests, ...sentRequests],
    [receivedRequests, sentRequests]
  );

  const pendingRequests = allRequests.filter(
    (request) => request.status === "pending"
  );

  const acceptedRequests = allRequests.filter(
    (request) => request.status === "accepted"
  );

  const rejectedRequests = allRequests.filter(
    (request) => request.status === "rejected"
  );

  const formatDate = (date: string) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Exchange Requests</h1>
          <p>Manage your skill exchange requests.</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="request-summary">
        <div className="summary-card">
          <span>Pending</span>
          <strong>{pendingRequests.length}</strong>
        </div>

        <div className="summary-card">
          <span>Accepted</span>
          <strong>{acceptedRequests.length}</strong>
        </div>

        <div className="summary-card">
          <span>Rejected</span>
          <strong>{rejectedRequests.length}</strong>
        </div>
      </div>

      <div className="dashboard-card requests-card">
        <div className="card-header">
          <div>
            <h2>Received Requests</h2>
            <p>People who want to learn from you.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading requests...</p>
        ) : receivedRequests.length === 0 ? (
          <div className="empty-requests">
            <h3>No received requests</h3>
            <p>
              Requests from other users will appear here.
            </p>
          </div>
        ) : (
          <div className="request-list">
            {receivedRequests.map((request) => (
              <div
                className="exchange-request"
                key={request.id}
              >
                <div className="request-avatar">
                  {request.senderName.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="exchange-request-info">
                  <h3>{request.senderName}</h3>

                  <p>
                    {request.senderRole || "Skill Exchanger"}
                  </p>

                  <span>
                    Wants to learn:{" "}
                    <strong>{request.skillName}</strong>
                  </span>

                  <small>
                    {formatDate(request.createdAt)}
                  </small>
                </div>

                <div className="request-actions">
                  {request.status === "pending" ? (
                    <>
                      <button
                        className="accept-button"
                        disabled={processingId === request.id}
                        onClick={() =>
                          void updateRequestStatus(
                            request.id,
                            "accepted"
                          )
                        }
                      >
                        {processingId === request.id
                          ? "Processing..."
                          : "Accept"}
                      </button>

                      <button
                        className="reject-button"
                        disabled={processingId === request.id}
                        onClick={() =>
                          void updateRequestStatus(
                            request.id,
                            "rejected"
                          )
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`status ${request.status}-status`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-card requests-card">
        <div className="card-header">
          <div>
            <h2>Sent Requests</h2>
            <p>Requests you have sent to other users.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading requests...</p>
        ) : sentRequests.length === 0 ? (
          <div className="empty-requests">
            <h3>No sent requests</h3>
            <p>
              Visit Discover to find someone and send an exchange
              request.
            </p>
          </div>
        ) : (
          <div className="request-list">
            {sentRequests.map((request) => (
              <div
                className="exchange-request"
                key={request.id}
              >
                <div className="request-avatar">
                  {request.receiverName.charAt(0).toUpperCase() ||
                    "U"}
                </div>

                <div className="exchange-request-info">
                  <h3>{request.receiverName}</h3>

                  <p>
                    {request.receiverRole || "Skill Exchanger"}
                  </p>

                  <span>
                    Skill requested:{" "}
                    <strong>{request.skillName}</strong>
                  </span>

                  <small>
                    {formatDate(request.createdAt)}
                  </small>
                </div>

                <div className="request-actions">
                  <span
                    className={`status ${request.status}-status`}
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Requests;