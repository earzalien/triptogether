import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import Guests from "../components/Guests";
import NavTabs from "../components/NavTabs";
import TripInfos from "../components/TripInfos";
import type { Guest, invitationType } from "../types/invitationType";
import type { TheTrip } from "../types/tripType";
import "./styles/invitations.css";

type RouteParams = {
  id: string;
};

type InvitationsResponse =
  | {
      trip: TheTrip & {
        owner_firstname?: string;
        owner_lastname?: string;
      };
      invitations: invitationType[];
    }
  | { error?: string; message?: string };

function Invitations() {
  const { id } = useParams<RouteParams>();
  const tripId = Number(id);
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TheTrip | null>(null);
  const [attendees, setAttendees] = useState<Guest[]>([]);
  const [otherInvitations, setOtherInvitations] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteInvitation, setDeleteInvitation] = useState<Guest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!tripId) {
      navigate("/", {
        state: {
          toast: { type: "error", message: "Voyage invalide" },
        },
      });
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tripResp, invitationsResp] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
            signal,
          }),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/invitations`,
            { signal },
          ),
        ]);

        if (!tripResp.ok) {
          throw new Error("Erreur chargement voyage");
        }

        if (!invitationsResp.ok) {
          throw new Error("Erreur chargement invitations");
        }

        const tripData: TheTrip = await tripResp.json();
        const invitationsResult: InvitationsResponse =
          await invitationsResp.json();

        if (!("trip" in invitationsResult)) {
          setError("Données invalides.");
          return;
        }

        const { invitations } = invitationsResult;

        setTrip(tripData);

        const creator: Guest = {
          id: tripData.user_id ?? 0,
          name: `${tripData.owner_firstname ?? ""} ${
            tripData.owner_lastname ?? ""
          }`.trim(),
          avatarUrl: null,
          addedAt: null,
          role: "organisateur",
        };

        const acceptedGuests: Guest[] = invitations
          .filter((inv) => inv.status === "accepted")
          .map((inv) => ({
            id: inv.user_id,
            name: `${inv.invited_firstname} ${inv.invited_lastname}`,
            avatarUrl: null,
            addedAt: inv.created_at,
            role: "membre",
          }));

        const otherGuests: Guest[] = invitations
          .filter((inv) => inv.status !== "accepted")
          .map((inv) => ({
            id: inv.user_id,
            name: `${inv.invited_firstname} ${inv.invited_lastname}`,
            avatarUrl: null,
            addedAt: inv.created_at,
            inviteState: inv.status === "refused" ? "refuse" : "en-attente",
            lastReminderAt: null,
          }));

        setAttendees([creator, ...acceptedGuests]);
        setOtherInvitations(otherGuests);
      } catch (err) {
        if (!signal.aborted) {
          console.error(err);
          setError("Impossible de charger les données.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [tripId, navigate]);

  const removeParticipant = async (userId: number) => {
    if (!tripId) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invitation/${tripId}/${userId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error();
      }

      setAttendees((prev) =>
        prev.filter((participant) => participant.id !== userId),
      );

      toast.success("Membre retiré du voyage.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
      setDeleteInvitation(null);
    }
  };

  return (
    <>
      {!loading && trip && <TripInfos trip={trip} />}

      <div className="page-membre">
        <NavTabs />

        <section id="member-list">
          {loading && <p className="loading-text">Chargement des membres...</p>}

          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <>
              <Guests
                title="Participants"
                invited={attendees}
                type="attendees"
                delete={setDeleteInvitation}
              />

              <Guests
                title="Invités"
                invited={otherInvitations}
                type="others"
              />
            </>
          )}
        </section>

        {deleteInvitation && (
          <div className="modal-backdrop">
            <div className="modal">
              <h4>Retirer ce membre ?</h4>

              <p>
                Voulez-vous vraiment retirer{" "}
                <strong>{deleteInvitation.name}</strong> de ce voyage ?
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn modal-btn-secondary"
                  onClick={() => setDeleteInvitation(null)}
                  disabled={isDeleting}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="modal-btn modal-btn-danger"
                  onClick={() => removeParticipant(deleteInvitation.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Suppression..." : "Confirmer le retrait"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Invitations;
