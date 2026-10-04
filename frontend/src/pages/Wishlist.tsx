import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface WishlistItem {
  id: string;
  targetUserId: string;
  skillId: string;
  skillName: string;
  createdAt: string;
}

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/wishlist");

      setWishlist(response.data.wishlist || []);
    } catch (err: unknown) {
      console.error("Failed to load wishlist:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWishlist();
  }, []);

  const handleRemove = async (wishlistId: string) => {
    try {
      setError("");

      await api.delete(`/users/wishlist/${wishlistId}`);

      setWishlist((current) =>
        current.filter((item) => item.id !== wishlistId)
      );
    } catch (err: unknown) {
      console.error("Failed to remove wishlist item:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove wishlist item."
      );
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>Wishlist</h1>
            <p>Your saved skills.</p>
          </div>
        </div>

        <div className="dashboard-card">
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Wishlist ❤️</h1>
          <p>Skills you want to explore later.</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-card">
        {wishlist.length === 0 ? (
          <div className="empty-sessions">
            <h3>Your wishlist is empty</h3>

            <p>
              Save interesting skills from Discover
              and they will appear here.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/discover")}
            >
              Explore Skills
            </button>
          </div>
        ) : (
          <div className="session-list">
            {wishlist.map((item) => (
              <div
                className="session-item"
                key={item.id}
              >
                <div className="session-icon">
                  ❤️
                </div>

                <div className="session-info">
                  <strong>{item.skillName}</strong>

                  <span>
                    Saved to your wishlist
                  </span>
                </div>

                <div className="session-actions">
                  <button
                    type="button"
                    className="reject-button"
                    onClick={() =>
                      void handleRemove(item.id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;