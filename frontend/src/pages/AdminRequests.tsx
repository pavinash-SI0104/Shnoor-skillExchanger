import { useEffect, useState } from "react";
import api from "../api/api";

interface AdminRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  skillId: string;
  skillName: string;
  skillLevel: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

function AdminRequests() {
  const [requests, setRequests] =
    useState<AdminRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/requests");

      if (response.data?.success) {
        setRequests(
          response.data.requests || []
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to load requests."
        );
      }
    } catch (err: any) {
      console.error(
        "Admin requests error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  };

  const getStatusClass = (
    status: string
  ) => {
    return `status ${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Requests</h1>

            <p>
              Monitor skill exchange requests
              across the platform.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="empty-state">
            <strong>
              Loading requests...
            </strong>

            <span>
              Please wait a moment.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Requests</h1>

            <p>
              Monitor skill exchange requests
              across the platform.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="error-message">
            {error}
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={loadRequests}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Requests</h1>

          <p>
            Monitor skill exchange requests
            across the platform.
          </p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>
            All Exchange Requests
          </h3>

          <span>
            {requests.length}{" "}
            {requests.length === 1
              ? "request"
              : "requests"}
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              🤝
            </div>

            <strong>
              No exchange requests
            </strong>

            <span>
              Requests between users will
              appear here.
            </span>
          </div>
        ) : (
          <div>
            {requests.map(
              (request) => (
                <div
                  className="request-item"
                  key={request.id}
                >
                  <div className="user-avatar">
                    {request.senderName
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div className="request-info">
                    <strong>
                      {request.senderName ||
                        "Unknown user"}
                    </strong>

                    <span>
                      wants to learn{" "}
                      <strong>
                        {request.skillName ||
                          "Unknown skill"}
                      </strong>{" "}
                      from{" "}
                      {request.receiverName ||
                        "Unknown user"}
                    </span>

                    <small>
                      Level:{" "}
                      {request.skillLevel ||
                        "Not specified"}{" "}
                      •{" "}
                      {formatDate(
                        request.createdAt
                      )}
                    </small>
                  </div>

                  <span
                    className={getStatusClass(
                      request.status
                    )}
                  >
                    {request.status}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRequests;
