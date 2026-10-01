import { useState } from "react";

interface Request {
  id: number;
  name: string;
  role: string;
  skill: string;
  type: "received" | "sent";
  status: "pending" | "accepted" | "rejected";
}

function Requests() {

  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      name: "Avinash",
      role: "Full Stack Developer",
      skill: "React",
      type: "received",
      status: "pending"
    },
    {
      id: 2,
      name: "Rahul",
      role: "Frontend Developer",
      skill: "Python",
      type: "sent",
      status: "pending"
    },
    {
      id: 3,
      name: "Anjali",
      role: "UI/UX Designer",
      skill: "Figma",
      type: "received",
      status: "accepted"
    }
  ]);


  const updateRequestStatus = (
    id: number,
    status: "accepted" | "rejected"
  ) => {

    setRequests(
      requests.map((request) =>
        request.id === id
          ? { ...request, status }
          : request
      )
    );

  };


  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );

  const acceptedRequests = requests.filter(
    (request) => request.status === "accepted"
  );

  const rejectedRequests = requests.filter(
    (request) => request.status === "rejected"
  );


  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>

          <h1>Exchange Requests</h1>

          <p>
            Manage your skill exchange requests.
          </p>

        </div>

      </div>


      {/* SUMMARY */}

      <div className="request-summary">

        <div className="summary-card">

          <span>Pending</span>

          <strong>
            {pendingRequests.length}
          </strong>

        </div>


        <div className="summary-card">

          <span>Accepted</span>

          <strong>
            {acceptedRequests.length}
          </strong>

        </div>


        <div className="summary-card">

          <span>Rejected</span>

          <strong>
            {rejectedRequests.length}
          </strong>

        </div>

      </div>


      {/* REQUEST LIST */}

      <div className="dashboard-card requests-card">

        <div className="card-header">

          <div>

            <h2>
              Your Requests
            </h2>

            <p>
              Incoming and outgoing skill exchange requests.
            </p>

          </div>

        </div>


        <div className="request-list">

          {requests.length === 0 ? (

            <div className="empty-requests">

              <h3>
                No requests yet
              </h3>

              <p>
                Your skill exchange requests will appear here.
              </p>

            </div>

          ) : (

            requests.map((request) => (

              <div
                className="exchange-request"
                key={request.id}
              >

                {/* AVATAR */}

                <div className="request-avatar">

                  {request.name.charAt(0)}

                </div>


                {/* INFORMATION */}

                <div className="exchange-request-info">

                  <h3>
                    {request.name}
                  </h3>

                  <p>
                    {request.role}
                  </p>

                  <span>
                    Skill: <strong>{request.skill}</strong>
                  </span>

                  <small>

                    {request.type === "received"
                      ? "Incoming request"
                      : "Request sent"}

                  </small>

                </div>


                {/* STATUS / ACTIONS */}

                <div className="request-actions">

                  {request.status === "pending" && (
                    <>
                      {request.type === "received" ? (

                        <>

                          <button
                            className="accept-button"
                            onClick={() =>
                              updateRequestStatus(
                                request.id,
                                "accepted"
                              )
                            }
                          >
                            Accept
                          </button>

                          <button
                            className="reject-button"
                            onClick={() =>
                              updateRequestStatus(
                                request.id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </button>

                        </>

                      ) : (

                        <span className="status pending-status">
                          Pending
                        </span>

                      )}
                    </>
                  )}


                  {request.status === "accepted" && (

                    <span className="status accepted-status">
                      Accepted
                    </span>

                  )}


                  {request.status === "rejected" && (

                    <span className="status rejected-status">
                      Rejected
                    </span>

                  )}

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default Requests;